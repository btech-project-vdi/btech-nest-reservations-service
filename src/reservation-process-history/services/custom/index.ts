export * from './reservation-process-history-confirm-reservation.service';
export * from './reservation-process-history-confirm-list.service';
export * from './reservation-process-history-custom.service';

import { ReservationProcessHistoryConfirmReservationService } from './reservation-process-history-confirm-reservation.service';
import { ReservationProcessHistoryConfirmListService } from './reservation-process-history-confirm-list.service';
import { ReservationProcessHistoryCustomService } from './reservation-process-history-custom.service';

export const RESERVATION_PROCESS_HISTORY_CUSTOM_SERVICES = [
  ReservationProcessHistoryConfirmReservationService,
  ReservationProcessHistoryConfirmListService,
  ReservationProcessHistoryCustomService,
];
