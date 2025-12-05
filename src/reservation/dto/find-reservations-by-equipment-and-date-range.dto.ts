import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { StatusReservation } from '../enums/status-reservation.enum';

export class FindReservationsByEquipmentAndDateRangeDto {
  @IsString({
    message: 'El campo laboratoryEquipmentId debe ser un UUID',
  })
  @IsNotEmpty({
    message: 'El campo laboratoryEquipmentId no puede estar vacío',
  })
  laboratoryEquipmentId: string;

  @IsNotEmpty({ message: 'El campo fecha inicial no puede estar vacío' })
  @IsDateString(
    {},
    { message: 'El campo fecha inicial no es una fecha válida' },
  )
  initialDate: string;

  @IsNotEmpty({ message: 'El campo fecha final no puede estar vacío' })
  @IsDateString({}, { message: 'El campo fecha final no es una fecha válida' })
  finalDate: string;
}

export class FindReservationsByEquipmentAndDateRangeResponseDto {
  reservationLaboratoryEquipmentId: string;
  laboratoryEquipmentId: string;
  reservationDate: Date;
  reservationFinalDate: Date;
  initialHour: string;
  finalHour: string;
  status: StatusReservation;
}
