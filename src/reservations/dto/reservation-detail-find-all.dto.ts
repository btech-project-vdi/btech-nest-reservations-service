export class ReservationDetailFindAllResponseDto {
  reservationLaboratoryEquipeId: string;
  laboratoryEquipment: LaboratoryEquipmentFindAllResponseDto;
  reservationDate: string;
  reservationFinalDate: string;
  initialHour: string;
  finalHour: string;
  duration: number;
  metadata: Record<string, any>;
}

export class LaboratoryEquipmentFindAllResponseDto {
  laboratoryEquipmentId: string;
  laboratoryId: string;
  laboratory: string;
  equipmentId: string;
  equipment: string;
}
