export * from './reservation-validate-detail.service';
export * from './reservation-validate-consecutive-days.service';
export * from './reservation-validate-single-day.service';
export * from './reservation-prepare-and-validate.service';
export * from './reservation-validate-repeated.service';
export * from './reservation-validate-hours-disponibility.service';
export * from './reservation-check-user-reservation-limit.service';
export * from './reservation-get-available-slots.service';
export * from './reservation-validate-alert-levels.service';
export * from './reservation-validation.service';

import { ReservationValidateDetailService } from './reservation-validate-detail.service';
import { ReservationValidateConsecutiveDaysService } from './reservation-validate-consecutive-days.service';
import { ReservationValidateSingleDayService } from './reservation-validate-single-day.service';
import { ReservationPrepareAndValidateService } from './reservation-prepare-and-validate.service';
import { ReservationValidateRepeatedService } from './reservation-validate-repeated.service';
import { ReservationValidateHoursDisponibilityService } from './reservation-validate-hours-disponibility.service';
import { ReservationCheckUserReservationLimitService } from './reservation-check-user-reservation-limit.service';
import { ReservationGetAvailableSlotsService } from './reservation-get-available-slots.service';
import { ReservationValidateAlertLevelsService } from './reservation-validate-alert-levels.service';
import { ReservationValidationService } from './reservation-validation.service';

export const RESERVATION_VALIDATION_SERVICES = [
  ReservationValidateDetailService,
  ReservationValidateConsecutiveDaysService,
  ReservationValidateSingleDayService,
  ReservationPrepareAndValidateService,
  ReservationValidateRepeatedService,
  ReservationValidateHoursDisponibilityService,
  ReservationCheckUserReservationLimitService,
  ReservationGetAvailableSlotsService,
  ReservationValidateAlertLevelsService,
  ReservationValidationService,
];
