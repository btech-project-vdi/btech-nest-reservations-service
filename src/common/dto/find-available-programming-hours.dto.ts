import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NamesDay } from '../enums/names-day.enum';

export class FindAvailableProgrammingHoursDto {
  @IsNotEmpty({
    message: 'Los IDs de laboratorio de detalle de suscripción son requeridos',
  })
  @IsString({
    each: true,
    message:
      'Cada ID de laboratorio de detalle de suscripción debe ser un UUID válido',
  })
  laboratoriesSubscriptionDetailsIds: string[];

  @IsNotEmpty({ message: 'El día de la semana es requerido' })
  @IsString({ message: 'El día de la semana debe ser un texto' })
  @IsEnum(NamesDay, {
    message:
      'El día de la semana debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo',
  })
  dayOfWeek: string;

  @IsNotEmpty({ message: 'La fecha de consulta es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' },
  )
  queryDate: string;

  @IsNotEmpty({ message: 'La hora inicial es requerida' })
  @IsString({ message: 'La hora inicial debe ser un texto' })
  initialHour: string;

  @IsNotEmpty({ message: 'La hora final es requerida' })
  @IsString({ message: 'La hora final debe ser un texto' })
  finalHour: string;
}

export class FindAvailableProgrammingHoursResponseDto {
  programmingHoursId: string;
  serviceId: string;
  initialHour: string;
  finalHour: string;
  isActive: boolean;
}
