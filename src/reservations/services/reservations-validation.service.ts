import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { FindOneByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-by-laboratory-equipment-id.dto';
import { isValidDayOfWeek } from '../helpers/is-valid-day-of-week.helper';
import { validateReservationHourRange } from '../helpers/validate-reservation-hour-range.helper';
import { checkExistingUserReservations } from '../helpers/check-existing-user-reservations.helper';
import { validateReservationDate } from '../helpers/validate-reservation-date.helper';
import { getNextDayName } from 'src/common/helpers/get-day-name.helper';
import { ValidateHoursDisponibilityDto } from '../dto/validate-hours-disponibility.dto';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';
import { validateSelfOverlappingReservations } from '../helpers/validate-selft-overlapping-reservations.helper';
import { validateUniqueEquipmentPerDayInRequest } from '../helpers/validate-unique-equipment-per-day-in-request.helper';
import { ConcurrencyValidateService } from 'src/concurrency/services/concurrency-validate.service';

@Injectable()
export class ReservationsValidationService {
  constructor(
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
    private readonly concurrencyValidateService: ConcurrencyValidateService,
  ) {}

  async validateReservationDetail(
    detail: CreateReservationDetailDto,
    index: number,
    user: SessionUserDataDto,
    userId: string,
    existingUserReservations: ReservationLaboratoryEquipment[],
    validateHoursCallback: (
      dto: ValidateHoursDisponibilityDto,
      userId: string,
    ) => Promise<any[]>,
  ) {
    isValidDayOfWeek(detail.dayName, detail.initialDate);
    const laboratory =
      await this.adminLaboratoriesService.findOneByLaboratoryEquipmentId(
        detail.laboratoryEquipmentId,
      );
    validateReservationHourRange(
      detail.initialHour,
      detail.finalHour,
      detail.initialDate,
      detail.finalDate,
      index,
    );
    checkExistingUserReservations(detail, existingUserReservations);
    validateReservationDate(detail.initialDate, index);
    const crossesMidnight = detail.finalHour < detail.initialHour;
    if (crossesMidnight) {
      const nextDayName = getNextDayName(detail.dayName);
      await this.validateConsecutiveDaysAvailability(
        detail,
        user,
        userId,
        laboratory,
        nextDayName,
        validateHoursCallback,
      );
    } else {
      await this.validateSingleDayAvailability(
        detail,
        user,
        laboratory,
        userId,
        validateHoursCallback,
      );
    }
    // Validar límites de concurrencia
    await this.concurrencyValidateService.validateConcurrency({
      laboratoryEquipmentId: detail.laboratoryEquipmentId,
      subscriptionDetailId: user.subscription?.subscriptionDetailId,
      reservationDate: detail.initialDate.split('T')[0],
      initialHour: detail.initialHour,
      finalHour: detail.finalHour,
    });
  }

  async validateConsecutiveDaysAvailability(
    detail: CreateReservationDetailDto,
    user: SessionUserDataDto,
    userId: string,
    laboratory: FindOneByLaboratoryEquipmentIdResponseDto,
    nextDayName: string,
    validateHoursCallback: (
      dto: ValidateHoursDisponibilityDto,
      userId: string,
    ) => Promise<any[]>,
  ) {
    // Validar parte del día inicial (desde initialHour hasta 23:59)
    const initialDayAvailability = await validateHoursCallback(
      {
        dayOfWeek: detail.dayName,
        date: detail.initialDate.split('T')[0],
        initialHour: detail.initialHour,
        finalHour: '23:59',
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );
    // Calcular fecha del día siguiente
    const nextDayDate = new Date(detail.initialDate);
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    const nextDayDateStr = nextDayDate.toISOString().split('T')[0];
    // Validar parte del día siguiente (desde 00:00 hasta finalHour)
    const nextDayAvailability = await validateHoursCallback(
      {
        dayOfWeek: nextDayName,
        date: nextDayDateStr,
        initialHour: '00:00',
        finalHour: detail.finalHour,
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );

    if (initialDayAvailability.length === 0 || nextDayAvailability.length === 0)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El laboratorio no tiene programación disponible para la reserva que cruza medianoche entre ${detail.dayName} y ${nextDayName}`,
      });
  }

  async validateSingleDayAvailability(
    detail: CreateReservationDetailDto,
    user: SessionUserDataDto,
    laboratory: FindOneByLaboratoryEquipmentIdResponseDto,
    userId: string,
    validateHoursCallback: (
      dto: ValidateHoursDisponibilityDto,
      userId: string,
    ) => Promise<any[]>,
  ) {
    const availability = await validateHoursCallback(
      {
        dayOfWeek: detail.dayName,
        date: detail.initialDate.split('T')[0],
        initialHour: detail.initialHour,
        finalHour: detail.finalHour,
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );

    if (availability.length === 0) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El laboratorio no tiene programación disponible para ${detail.dayName} entre ${detail.initialHour} y ${detail.finalHour}`,
      });
    }
  }

  async prepareAndValidateReservation(
    user: SessionUserDataDto,
    reservationDetails: CreateReservationDetailDto[],
  ): Promise<ReservationLaboratoryEquipment[]> {
    // 1. Validaciones "locales" (dentro de la misma solicitud)
    validateSelfOverlappingReservations(reservationDetails);
    validateUniqueEquipmentPerDayInRequest(reservationDetails);

    // Determinar el rango de fechas de la nueva reserva
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    if (reservationDetails.length === 0)
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message:
          'La solicitud de reserva no contiene detalles. Por favor, agregue detalles a la solicitud de reserva.',
      });

    for (const detail of reservationDetails) {
      const currentDate = new Date(detail.initialDate);
      if (isNaN(currentDate.getTime()))
        throw new RpcException({
          code: HttpStatus.BAD_REQUEST,
          message: `La fecha de inicio de la reserva no es válida: ${detail.initialDate}`,
        });
      if (!minDate || currentDate < minDate) minDate = currentDate;
      if (!maxDate || currentDate > maxDate) maxDate = currentDate;
    }

    // Ampliar el rango de búsqueda para incluir el día completo de la fecha final
    const searchStartDate = minDate as Date;
    const searchEndDate = new Date((maxDate as Date).getTime());
    searchEndDate.setDate(searchEndDate.getDate() + 1);

    // Obtener todas las reservas existentes del usuario para el rango de fechas relevante
    const existingUserReservations =
      await this.reservationLaboratoryEquipmentService.findReservationsByUserAndDateRange(
        user.subscriberId,
        searchStartDate,
        searchEndDate,
      );

    return existingUserReservations;
  }
}
