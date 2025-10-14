import { IsNotEmpty, IsUUID } from 'class-validator';

export class FindOneReservationLaboratoryEquipmentDto {
  @IsNotEmpty()
  @IsUUID()
  reservationLaboratoryEquipmentId: string;
}

export class FindOneReservationLaboratoryEquipmentResponseDto {
  reservationLaboratoryEquipmentId: string;
  laboratoryEquipmentId: string;
  reservationDate: string;
  reservationFinalDate: string;
  initialHour: string;
  finalHour: string;
  duration: number;
  metadata: Record<string, any>;
}
