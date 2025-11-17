export * from './reservation-laboratory-equipment-confirm-list.service';
export * from './reservation-laboratory-equipment-find-for-reminder.service';
export * from './reservation-laboratory-equipment-complete-finished.service';
export * from './reservation-laboratory-equipment-get-equipment-ids.service';
export * from './reservation-laboratory-equipment-get-subscriber-metadata.service';
export * from './reservation-laboratory-equipment-get-subscriber-profile.service';
export * from './reservation-laboratory-equipment-find-overlapping-reservations.service';
export * from './reservation-laboratory-equipment-get-laboratory-metadata.service';
export * from './reservation-laboratory-equipment-assign-credentials.service';
export * from './reservation-laboratory-equipment-custom.service';

import { ReservationLaboratoryEquipmentConfirmListService } from './reservation-laboratory-equipment-confirm-list.service';
import { ReservationLaboratoryEquipmentFindForReminderService } from './reservation-laboratory-equipment-find-for-reminder.service';
import { ReservationLaboratoryEquipmentCompleteFinishedService } from './reservation-laboratory-equipment-complete-finished.service';
import { ReservationLaboratoryEquipmentGetEquipmentIdsService } from './reservation-laboratory-equipment-get-equipment-ids.service';
import { ReservationLaboratoryEquipmentGetSubscriberMetadataService } from './reservation-laboratory-equipment-get-subscriber-metadata.service';
import { ReservationLaboratoryEquipmentGetSubscriberProfileService } from './reservation-laboratory-equipment-get-subscriber-profile.service';
import { ReservationLaboratoryEquipmentFindOverlappingReservationsService } from './reservation-laboratory-equipment-find-overlapping-reservations.service';
import { ReservationLaboratoryEquipmentGetLaboratoryMetadataService } from './reservation-laboratory-equipment-get-laboratory-metadata.service';
import { ReservationLaboratoryEquipmentAssignCredentialsService } from './reservation-laboratory-equipment-assign-credentials.service';
import { ReservationLaboratoryEquipmentCustomService } from './reservation-laboratory-equipment-custom.service';

export const RESERVATION_LABORATORY_EQUIPMENT_CUSTOM_SERVICES = [
  ReservationLaboratoryEquipmentConfirmListService,
  ReservationLaboratoryEquipmentFindForReminderService,
  ReservationLaboratoryEquipmentCompleteFinishedService,
  ReservationLaboratoryEquipmentGetEquipmentIdsService,
  ReservationLaboratoryEquipmentGetSubscriberMetadataService,
  ReservationLaboratoryEquipmentGetSubscriberProfileService,
  ReservationLaboratoryEquipmentFindOverlappingReservationsService,
  ReservationLaboratoryEquipmentGetLaboratoryMetadataService,
  ReservationLaboratoryEquipmentAssignCredentialsService,
  ReservationLaboratoryEquipmentCustomService,
];
