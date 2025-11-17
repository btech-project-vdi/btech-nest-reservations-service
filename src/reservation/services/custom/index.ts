export * from './reservation-find-admin-reservations.service';
export * from './reservation-find-subscribers-list.service';
export * from './reservation-find-available-labs-with-reservations.service';
export * from './reservation-custom.service';
export * from './reservation-find-equipment-map.service';

import { ReservationFindAdminReservationsService } from './reservation-find-admin-reservations.service';
import { ReservationFindSubscribersListService } from './reservation-find-subscribers-list.service';
import { ReservationFindAvailableLabsWithReservationsService } from './reservation-find-available-labs-with-reservations.service';
import { ReservationCustomService } from './reservation-custom.service';
import { ReservationFindEquipmentMapService } from './reservation-find-equipment-map.service';

export const RESERVATION_CUSTOM_SERVICES = [
  ReservationFindAdminReservationsService,
  ReservationFindSubscribersListService,
  ReservationFindEquipmentMapService,
  ReservationFindAvailableLabsWithReservationsService,
  ReservationCustomService,
];
