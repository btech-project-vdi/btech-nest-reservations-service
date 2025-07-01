import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { StatusReservation } from 'src/reservations/enums/status-reservation.enum';
import { StatusResponse } from 'src/reservations/enums/status-response.enum';

export class ConfirmReservationDto {
  @IsUUID('all', {
    message:
      'El campo reservationLaboratoryEquipmentId debe ser un UUID válido',
  })
  @IsNotEmpty({
    message: 'El campo reservationLaboratoryEquipmentId es obligatorio',
  })
  reservationLaboratoryEquipmentId: string;

  @IsOptional()
  @IsString({ message: 'El mensaje debe ser una cadena de caracteres' })
  message: string;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'El código de estado debe ser un número entero',
    },
  )
  statusCode: number;

  @IsOptional()
  @IsEnum(StatusResponse, {
    message: 'El estado debe ser uno de los valores válidos',
  })
  status: StatusResponse;

  @IsOptional()
  metadata?: Record<string, string>;

  @IsOptional()
  @IsEnum(StatusReservation, {
    message: 'La reserva debe ser una de las opciones válidas',
  })
  statusReservation: StatusReservation;
}
