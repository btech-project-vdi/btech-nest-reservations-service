export * from './reservation-process-history-create.service';
export * from './reservation-process-history-core.service';

import { ReservationProcessHistoryCreateService } from './reservation-process-history-create.service';
import { ReservationProcessHistoryCoreService } from './reservation-process-history-core.service';

export const RESERVATION_PROCESS_HISTORY_CORE_SERVICES = [
  ReservationProcessHistoryCreateService,
  ReservationProcessHistoryCoreService,
];
