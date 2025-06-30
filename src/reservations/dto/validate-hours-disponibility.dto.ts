import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
  Max,
  Matches,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { NamesDay } from '../enums/names-day.enum';

export class ValidateHoursDisponibilityDto {
  @IsNotEmpty({ message: 'El día de la semana es requerido' })
  @IsString({ message: 'El día de la semana debe ser un texto' })
  @IsEnum(NamesDay, {
    message:
      'El día de la semana debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo',
  })
  dayOfWeek: string;

  @IsNotEmpty({ message: 'La fecha es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' },
  )
  date: string;

  @IsNotEmpty({ message: 'La hora inicial es requerida' })
  @IsString({ message: 'La hora inicial debe ser un texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3])$/, {
    message: 'La hora inicial debe estar en formato HH (00-23)',
  })
  initialHour: string;

  @IsNotEmpty({ message: 'La hora final es requerida' })
  @IsString({ message: 'La hora final debe ser un texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3])$/, {
    message: 'La hora final debe estar en formato HH (00-23)',
  })
  finalHour: string;

  @IsNotEmpty({ message: 'El ID de suscripción empresarial es requerido' })
  @IsUUID('all', {
    message: 'El ID de suscripción empresarial debe ser un UUID válido',
  })
  subscriptionBussineId: string;

  @IsNotEmpty({ message: 'El número de días de reserva es requerido' })
  @IsInt({ message: 'El número de días de reserva debe ser un número entero' })
  @Min(1, { message: 'El número de días de reserva debe ser al menos 1' })
  @Max(30, { message: 'El número de días de reserva no puede ser mayor a 30' })
  @Transform(({ value }) => parseInt(value))
  numberReservationDays: number;
}
