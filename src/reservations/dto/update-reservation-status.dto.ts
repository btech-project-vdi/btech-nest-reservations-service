import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { StatusReservation } from '../enums/status-reservation.enum';

export class UpdateReservationStatusDto {
  @IsNotEmpty({
    message: 'El campo reservationLaboratoryEquipmentId es obligatorio',
  })
  @IsUUID('all', {
    message:
      'El campo reservationLaboratoryEquipmentId debe ser un UUID válido',
  })
  reservationLaboratoryEquipmentId: string;

  @IsNotEmpty({
    message: 'El campo status es obligatorio',
  })
  @IsEnum(StatusReservation, {
    message:
      'El campo status debe ser: PENDIENTE, CONFIRMADO, CULMINADO o CANCELADO',
  })
  status: StatusReservation;

  @IsOptional()
  @IsUUID('all', {
    message: 'El campo subscriptionDetailId debe ser un UUID válido',
  })
  subscriptionDetailId?: string;
}
