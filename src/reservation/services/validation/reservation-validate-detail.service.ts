import { Injectable } from '@nestjs/common';
import { ReservationLaboratoryEquipment } from 'src/reservation-laboratory-equipment/entities/reservation-laboratory-equipment.entity';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { getNextDayName } from 'src/common/helpers/get-day-name.helper';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { ConcurrencyEquipmentValidationService } from 'src/concurrency/services/validation';
import { ReservationValidateConsecutiveDaysService } from './reservation-validate-consecutive-days.service';
import { ReservationValidateSingleDayService } from './reservation-validate-single-day.service';
import { CreateReservationDetailDto } from 'src/reservation/dto/create-reservation-detail.dto';
import { ValidateHoursDisponibilityDto } from 'src/reservation/dto/validate-hours-disponibility.dto';
import { isValidDayOfWeek } from 'src/reservation/helpers/is-valid-day-of-week.helper';
import { validateReservationHourRange } from 'src/reservation/helpers/validate-reservation-hour-range.helper';
import { checkExistingUserReservations } from 'src/reservation/helpers/check-existing-user-reservations.helper';
import { validateReservationDate } from 'src/reservation/helpers/validate-reservation-date.helper';

@Injectable()
export class ReservationValidateDetailService {
  constructor(
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly concurrencyValidationService: ConcurrencyEquipmentValidationService,
    private readonly reservationValidateConsecutiveDaysService: ReservationValidateConsecutiveDaysService,
    private readonly reservationValidateSingleDayService: ReservationValidateSingleDayService,
  ) {}

  async execute(
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
      await this.reservationValidateConsecutiveDaysService.execute(
        detail,
        user,
        userId,
        laboratory,
        nextDayName,
        validateHoursCallback,
      );
    } else {
      await this.reservationValidateSingleDayService.execute(
        detail,
        user,
        laboratory,
        userId,
        validateHoursCallback,
      );
    }
    // Validar límites de concurrencia
    await this.concurrencyValidationService.validateReservationConcurrency({
      laboratoryEquipmentId: detail.laboratoryEquipmentId,
      subscriptionDetailId: user.subscription?.subscriptionDetailId,
      reservationDate: detail.initialDate.split('T')[0],
      initialHour: detail.initialHour,
      finalHour: detail.finalHour,
    });
  }
}
