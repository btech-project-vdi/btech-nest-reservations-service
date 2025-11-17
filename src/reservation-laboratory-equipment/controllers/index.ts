export * from './reservation-laboratory-equipment-core.controller';
export * from './reservation-laboratory-equipment-validation.controller';

import { ReservationLaboratoryEquipmentCoreController } from './reservation-laboratory-equipment-core.controller';
import { ReservationLaboratoryEquipmentValidationController } from './reservation-laboratory-equipment-validation.controller';

export const RESERVATION_LABORATORY_EQUIPMENT_CONTROLLERS = [
  ReservationLaboratoryEquipmentCoreController,
  ReservationLaboratoryEquipmentValidationController,
];
