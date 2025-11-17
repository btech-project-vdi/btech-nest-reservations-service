export class LaboratoryDisponibilityResponseDto {
  laboratoryEquipmentId: string;
  laboratoryId: string;
  description: string;
  operationTime: OperationTime[];
  resources: (string | undefined)[];
}

export interface OperationTime {
  start: string;
  end: string;
}
