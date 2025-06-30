export class AvailableSlotDto {
  laboratoryId: string;
  laboratoryEquipmentId: string;
  description: string;
  slotId: string;
  initialHour: string;
  finalHour: string;
  laboratory: SlotLaboratoryDto;
}

export class EquipmentResourceDto {
  attribute: string;
  resource: string;
}

export class AvailableEquipmentDto {
  equipmentId: string;
  description: string;
  quantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  resources: EquipmentResourceDto[];
}

export class SlotLaboratoryDto {
  laboratoryId: string;
  description: string;
  equipment: AvailableEquipmentDto[];
}
