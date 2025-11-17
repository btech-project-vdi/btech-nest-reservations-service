export * from './reservation-laboratory-equipment-create.service';
export * from './reservation-laboratory-equipment-update-status.service';
export * from './reservation-laboratory-equipment-find-one.service';
export * from './reservation-laboratory-equipment-core.service';

import { ReservationLaboratoryEquipmentCreateService } from './reservation-laboratory-equipment-create.service';
import { ReservationLaboratoryEquipmentUpdateStatusService } from './reservation-laboratory-equipment-update-status.service';
import { ReservationLaboratoryEquipmentFindOneService } from './reservation-laboratory-equipment-find-one.service';
import { ReservationLaboratoryEquipmentCoreService } from './reservation-laboratory-equipment-core.service';

export const RESERVATION_LABORATORY_EQUIPMENT_CORE_SERVICES = [
  ReservationLaboratoryEquipmentCreateService,
  ReservationLaboratoryEquipmentUpdateStatusService,
  ReservationLaboratoryEquipmentFindOneService,
  ReservationLaboratoryEquipmentCoreService,
];
