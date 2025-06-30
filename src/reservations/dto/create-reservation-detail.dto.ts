import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateReservationDetailDto {
  @IsString({ message: 'El nombre del día es una cadena de caracteres' })
  @IsNotEmpty({ message: 'El nombre del día no puede estar vacío' })
  dayName: string;

  @IsString({
    message:
      'El id del equipo de laboratorio debe ser una cadena de caracteres',
  })
  @IsNotEmpty({
    message: 'El id del equipo de laboratorio no puede estar vacío',
  })
  laboratoryEquipmentId: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en formato YYYY-MM-DD',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha debe estar en formato YYYY-MM-DD',
    },
  )
  @IsNotEmpty({
    message: 'La fecha no puede estar vacía',
  })
  initialDate: string;

  @IsString({ message: 'La fecha no puede estar vacía' })
  @IsNotEmpty({ message: 'La hora inicial no puede estar vacío' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora inicial debe estar en formato HH:mm',
  })
  initialHour: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha final debe estar en formato YYYY-MM-DD',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha final debe estar en formato YYYY-MM-DD',
    },
  )
  @IsNotEmpty({
    message: 'La fecha final no puede estar vacía',
  })
  finalDate: string;

  @IsString({ message: 'La fecha no puede estar vacía' })
  @IsNotEmpty({ message: 'La hora final no puede estar vacío' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora final debe estar en formato HH:mm',
  })
  finalHour: string;

  @IsOptional()
  metadata: Record<string, any>;
}

export class CreateReservationDetailResponseDto {
  reservationLaboratoryEquipmentId: string;
  laboratoryEquipmentId: string;
  reservationDate: string;
  reservationFinalDate: string;
  initialHour: string;
  finalHour: string;
  metadata: Record<string, any>;
}
