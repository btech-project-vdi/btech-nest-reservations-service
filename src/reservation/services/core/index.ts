export * from './reservation-create.service';
export * from './reservation-find-all.service';
export * from './reservation-core.service';

import { ReservationCreateService } from './reservation-create.service';
import { ReservationFindAllService } from './reservation-find-all.service';
import { ReservationCoreService } from './reservation-core.service';

export const RESERVATION_CORE_SERVICES = [
  ReservationCreateService,
  ReservationFindAllService,
  ReservationCoreService,
];
