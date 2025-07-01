export class FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto {
  laboratoryEquipmentId: string;
  quantity: number;
  laboratory: LaboratoryResponseDto;
  equipment: EquipmentResponseDto;
}

export class LaboratoryResponseDto {
  laboratoryId: string;
  description: string;
}

export class EquipmentResponseDto {
  equipmentId: string;
  description: string;
}
