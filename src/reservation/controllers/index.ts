export * from './reservation-core.controller';
export * from './reservation-custom.controller';
export * from './reservation-validation.controller';

import { ReservationCoreController } from './reservation-core.controller';
import { ReservationCustomController } from './reservation-custom.controller';
import { ReservationValidationController } from './reservation-validation.controller';

export const RESERVATION_CONTROLLERS = [
  ReservationCoreController,
  ReservationCustomController,
  ReservationValidationController,
];
