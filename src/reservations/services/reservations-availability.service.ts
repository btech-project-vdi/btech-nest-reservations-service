import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ValidateHoursDisponibilityDto } from '../dto/validate-hours-disponibility.dto';
import { AdminLaboratoriesService } from '../../common/services/admin-laboratories.service';
import { AdminProgrammingService } from '../../common/services/admin-programming.service';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';
import { StatusReservation } from '../enums/status-reservation.enum';
import { RpcException } from '@nestjs/microservices';
import { FindAvailableProgrammingHoursResponseDto } from 'src/common/dto/find-available-programming-hours.dto';
import { FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto } from 'src/common/dto/find-laboratories-by-laboratories-subscription-detail-ids.dto';
import { formatValidateHoursResponse } from '../helpers/formate-validate-hours-response.helper';
import { AvailableSlotDto } from '../dto/get-available-slot.dto';

@Injectable()
export class ReservationsAvailabilityService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly adminProgrammingService: AdminProgrammingService,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  async validateHoursDisponibility(
    validateHoursDisponibilityDto: ValidateHoursDisponibilityDto,
    userId: string,
  ) {
    const {
      dayOfWeek,
      date,
      initialHour,
      finalHour,
      subscriptionDetailId,
      numberReservationDays,
    } = validateHoursDisponibilityDto;

    const queryDate = new Date(date);
    const initialHourString = `${initialHour}:00`;
    const finalHourString = `${finalHour}:00`;
    const queryDateFormatted = queryDate.toISOString().split('T')[0];

    // 1. Validar límite de reservas del usuario
    await this.hasUserReachedReservationLimit(
      userId,
      queryDateFormatted,
      numberReservationDays,
    );

    // 2. Obtener subscription details activos
    const laboratoriesSubscriptionDetailsIds =
      await this.adminLaboratoriesService.findLaboratoriesSubscriptionDetailsIdsBySubscriptionDetailId(
        subscriptionDetailId,
      );

    // 3. Obtener horarios de programación disponibles
    const availableProgrammingHours =
      await this.adminProgrammingService.findAvailableProgrammingHours({
        laboratoriesSubscriptionDetailsIds,
        dayOfWeek,
        queryDate: queryDateFormatted,
        initialHour: initialHourString,
        finalHour: finalHourString,
      });

    if (!availableProgrammingHours.length) return [];

    const laboratoriesInfo =
      await this.adminLaboratoriesService.findByLaboratoriesSubscriptionDetailsIds(
        laboratoriesSubscriptionDetailsIds,
      );

    // 5. Verificar disponibilidad real
    const resultWithAvailability = await this.getAvailableSlots(
      availableProgrammingHours,
      laboratoriesInfo,
      queryDateFormatted,
      initialHourString,
      finalHourString,
    );

    const validSlots = resultWithAvailability.filter(
      (slot) =>
        slot &&
        slot.laboratory &&
        slot.laboratory.equipment &&
        slot.laboratory.equipment.length > 0,
    );

    return validSlots.flatMap((slot: AvailableSlotDto) => {
      return formatValidateHoursResponse(slot);
    });
  }

  async hasUserReachedReservationLimit(
    userId: string,
    date: string,
    numberReservationDays: number,
  ): Promise<void> {
    const reservationsCount = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin(
        'reservation.reservationLaboratoryEquipment',
        'reservationLaboratoryEquipment',
      )
      .where('reservation.subscriberId = :userId', { userId })
      .andWhere('reservationLaboratoryEquipment.reservationDate = :date', {
        date,
      })
      .andWhere('reservationLaboratoryEquipment.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .getCount();
    if (reservationsCount >= numberReservationDays)
      throw new RpcException({
        status: 400,
        message: `El usuario ha alcanzado el límite de reservas para la fecha: ${date}`,
      });
  }

  private async getAvailableSlots(
    availableProgrammingHours: FindAvailableProgrammingHoursResponseDto[],
    laboratoriesInfo: FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto[],
    queryDateFormatted: string,
    initialHourString: string,
    finalHourString: string,
  ) {
    // Optimización: Pre-cargar disponibilidad de todos los equipos de una vez
    const laboratoryEquipmentIds = laboratoriesInfo
      .map((le) => le.laboratoryEquipmentId)
      .filter(Boolean);

    const availabilityMap =
      await this.reservationLaboratoryEquipmentService.checkAvailabilityBatch(
        laboratoryEquipmentIds,
        queryDateFormatted,
        initialHourString,
        finalHourString,
      );

    return await Promise.all(
      availableProgrammingHours.map((slot) => {
        const equipmentWithAvailability = laboratoriesInfo.map((le) => {
          if (!le.laboratoryEquipmentId) {
            return {
              ...le,
              availableQuantity: 0,
              isAvailable: false,
            };
          }

          // Usar disponibilidad pre-cargada en lugar de consulta individual
          const overlappingReservationsCount =
            availabilityMap.get(le.laboratoryEquipmentId) || 0;
          const availableQuantity = le.quantity - overlappingReservationsCount;

          return {
            equipmentId: le.equipment.equipmentId,
            description: le.equipment.description,
            quantity: le.quantity,
            availableQuantity,
            isAvailable: availableQuantity > 0,
            resources: le.equipment.equipmentResources.map((er) => ({
              attribute: er.attribute.description,
              resource: er.description,
            })),
          };
        });

        const firstLab = laboratoriesInfo[0];
        return {
          laboratoryId: firstLab.laboratory.laboratoryId,
          laboratoryEquipmentId: firstLab.laboratoryEquipmentId,
          description: firstLab.laboratory.description,
          slotId: slot.programmingHoursId,
          initialHour: slot.initialHour,
          finalHour: slot.finalHour,
          laboratory: {
            laboratoryId: firstLab.laboratory.laboratoryId,
            description: firstLab.laboratory.description,
            equipment: equipmentWithAvailability.filter((e) => e.isAvailable),
          },
        };
      }),
    );
  }
}
