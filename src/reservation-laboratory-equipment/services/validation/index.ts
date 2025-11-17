export * from './reservation-laboratory-equipment-find-by-equipment-range.service';
export * from './reservation-laboratory-equipment-find-by-user-range.service';
export * from './reservation-laboratory-equipment-check-availability-batch.service';
export * from './reservation-laboratory-equipment-validation.service';

import { ReservationLaboratoryEquipmentFindByEquipmentRangeService } from './reservation-laboratory-equipment-find-by-equipment-range.service';
import { ReservationLaboratoryEquipmentFindByUserRangeService } from './reservation-laboratory-equipment-find-by-user-range.service';
import { ReservationLaboratoryEquipmentCheckAvailabilityBatchService } from './reservation-laboratory-equipment-check-availability-batch.service';
import { ReservationLaboratoryEquipmentValidationService } from './reservation-laboratory-equipment-validation.service';

export const RESERVATION_LABORATORY_EQUIPMENT_VALIDATION_SERVICES = [
  ReservationLaboratoryEquipmentFindByEquipmentRangeService,
  ReservationLaboratoryEquipmentFindByUserRangeService,
  ReservationLaboratoryEquipmentCheckAvailabilityBatchService,
  ReservationLaboratoryEquipmentValidationService,
];
