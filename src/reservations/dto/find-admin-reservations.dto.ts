/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  Matches,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TimePeriod } from '../enums/time-period.enum';
import { FindAllReservationsResponseDto } from './find-all-reservations.dto';

export class FindAdminReservationsDto extends PaginationDto {
  @IsOptional()
  @IsUUID('all', { message: 'laboratoryEquipmentId debe ser un UUID válido' })
  laboratoryEquipmentId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'subscriberId debe ser un UUID válido' })
  subscriberId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'reservationId debe ser un UUID válido' })
  reservationId?: string;

  @IsOptional()
  @IsEnum(TimePeriod, {
    message: 'timePeriod debe ser un valor válido del enum TimePeriod',
  })
  timePeriod?: TimePeriod;

  // Campos requeridos solo cuando timePeriod es CUSTOM
  @ValidateIf((o) => o.timePeriod === TimePeriod.CUSTOM)
  @IsString({ message: 'startDate es requerida cuando timePeriod es CUSTOM' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate debe tener formato YYYY-MM-DD',
  })
  startDate?: string;

  @ValidateIf((o) => o.timePeriod === TimePeriod.CUSTOM)
  @IsString({ message: 'endDate es requerida cuando timePeriod es CUSTOM' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate debe tener formato YYYY-MM-DD',
  })
  endDate?: string;

  // Filtros opcionales de hora
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime debe tener formato HH:MM (24h)',
  })
  startTime?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime debe tener formato HH:MM (24h)',
  })
  endTime?: string;

  // Paginación para items dentro de cada reserva
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemPage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemLimit?: number;
}

export class FindAdminReservationsResponseDto extends FindAllReservationsResponseDto {}
