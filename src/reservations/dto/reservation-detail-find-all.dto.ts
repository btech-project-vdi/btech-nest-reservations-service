import { StatusReservation } from '../enums/status-reservation.enum';

export class ReservationDetailFindAllResponseDto {
  reservationLaboratoryEquipmentId: string;
  laboratoryEquipment: LaboratoryEquipmentFindAllResponseDto;
  reservationDate: string;
  reservationFinalDate: string;
  initialHour: string;
  finalHour: string;
  duration: number;
  metadata: Record<string, any>;
  status: StatusReservation;
}

export class LaboratoryEquipmentFindAllResponseDto {
  laboratoryEquipmentId: string;
  laboratoryId: string;
  laboratory: string;
  equipmentId: string;
  equipment: string;
}
