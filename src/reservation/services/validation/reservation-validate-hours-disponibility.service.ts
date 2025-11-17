import { Injectable } from '@nestjs/common';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { AdminProgrammingService } from 'src/common/services/admin-programming.service';
import { ReservationCheckUserReservationLimitService } from './reservation-check-user-reservation-limit.service';
import { ReservationGetAvailableSlotsService } from './reservation-get-available-slots.service';
import { ValidateHoursDisponibilityDto } from 'src/reservation/dto/validate-hours-disponibility.dto';
import { AvailableSlotDto } from 'src/reservation/dto/get-available-slot.dto';
import { formatValidateHoursResponse } from 'src/reservation/helpers/formate-validate-hours-response.helper';

@Injectable()
export class ReservationValidateHoursDisponibilityService {
  constructor(
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly adminProgrammingService: AdminProgrammingService,
    private readonly reservationCheckUserReservationLimitService: ReservationCheckUserReservationLimitService,
    private readonly reservationGetAvailableSlotsService: ReservationGetAvailableSlotsService,
  ) {}

  async execute(
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
    await this.reservationCheckUserReservationLimitService.execute(
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
    const resultWithAvailability =
      await this.reservationGetAvailableSlotsService.execute(
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
}
