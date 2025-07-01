import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
} from 'class-validator';
import { RepeatPattern } from '../enums/repeat-pattern.enum';
import { NamesDay } from '../enums/names-day.enum';

export class ValidateRepeatedReservationDto {
  @IsNotEmpty({
    message:
      'El campo de ID de la programación de la suscripción no puede estar vacío',
  })
  @IsUUID('4', {
    message:
      'El campo de ID de la programación de la suscripción debe ser un UUID',
  })
  programmingSubscriptionDetailId: string;

  @IsNotEmpty({
    message: 'El campo de ID del equipo de laboratorio no puede estar vacío',
  })
  @IsUUID('4', {
    message: 'El campo de ID del equipo de laboratorio no puede estar vacío',
  })
  laboratoryEquipmentId: string;

  @IsString({ message: 'La hora de inicio no puede estar vacía' })
  @IsNotEmpty({ message: 'La hora inicial no puede estar vacío' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora inicial debe estar en formato HH:mm',
  })
  initialHour: string; // Formato HH:MM

  @IsString({ message: 'La hora final no puede estar vacía' })
  @IsNotEmpty({ message: 'La hora final no puede estar vacío' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora final debe estar en formato HH:mm',
  })
  finalHour: string; // Formato HH:MM

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
  initialDate: string; // Formato YYYY-MM-DD

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de fin del slot debe estar en formato YYYY-MM-DD',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha de fin del slot debe estar en formato YYYY-MM-DD',
    },
  )
  @IsNotEmpty({
    message: 'La fecha de fin del slot no puede estar vacía',
  })
  finalDate: string;

  @IsEnum(RepeatPattern, {
    message: 'La repetición no es válida, tiene que ser diario o semanal',
  })
  @IsNotEmpty({ message: 'La repetición no puede estar vacía' })
  repeatPattern: RepeatPattern;

  @ValidateIf((o) => o.repeatPattern === RepeatPattern.WEEKLY)
  @IsEnum(NamesDay, {
    each: true,
    message:
      'El día es requerido y debe ser uno o más días de la semana Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo',
  })
  daysOfWeek?: NamesDay[]; // Solo requerido si es weekly

  @IsString()
  @IsOptional()
  repeatEndDate?: string;
}

export class ValidateRepeatedReservationResponseDto {
  dayName: string;
  laboratoryEquipeId: string;
  initialDate: string;
  finalDate: string;
  initialHour: string;
  finalHour: string;
  reason?: string;
}
