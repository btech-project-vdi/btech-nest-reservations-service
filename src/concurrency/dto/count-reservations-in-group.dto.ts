import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CountReservationsInGroupDto {
  @IsString({
    message:
      'El id del grupo de concurrencia debe ser una cadena de caracteres',
  })
  @IsNotEmpty({
    message: 'El id del grupo de concurrencia no puede estar vacío',
  })
  concurrencyId: string;

  @IsString({
    message:
      'El id del detalle de suscripción debe ser una cadena de caracteres',
  })
  @IsOptional()
  subscriptionDetailId: string;

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
  reservationDate: string;

  @IsString({ message: 'La hora inicial debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'La hora inicial no puede estar vacío' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora inicial debe estar en formato HH:mm',
  })
  initialHour: string;

  @IsString({ message: 'La hora final debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'La hora final no puede estar vacío' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora final debe estar en formato HH:mm',
  })
  finalHour: string;
}
