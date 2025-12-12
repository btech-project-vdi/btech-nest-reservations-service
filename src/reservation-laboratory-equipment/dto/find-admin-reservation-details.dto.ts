/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  Matches,
  IsArray,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TimePeriod } from 'src/reservation/enums/time-period.enum';
import { DateFilterType } from 'src/reservation/enums/date-filter-type.enum';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

export class FindAdminReservationDetailsDto extends PaginationDto {
  @IsOptional()
  @IsArray({ message: 'laboratoryEquipmentIds debe ser un arreglo' })
  @IsString({
    each: true,
    message: 'Cada laboratoryEquipmentId debe ser un string válido',
  })
  laboratoryEquipmentIds?: string[];

  @IsOptional()
  @IsArray({ message: 'subscriberIds debe ser un arreglo' })
  @IsUUID('all', {
    each: true,
    message: 'Cada subscriberId debe ser un UUID válido',
  })
  subscriberIds?: string[];

  @IsOptional()
  @IsUUID('all', { message: 'subscriptionDetailId debe ser un UUID válido' })
  subscriptionDetailId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'reservationId debe ser un UUID válido' })
  reservationId?: string;

  @IsOptional()
  @IsEnum(TimePeriod, {
    message: 'timePeriod debe ser un valor válido del enum TimePeriod',
  })
  timePeriod?: TimePeriod;

  @IsOptional()
  @IsEnum(DateFilterType, {
    message: 'dateFilterType debe ser un valor válido del enum DateFilterType',
  })
  dateFilterType?: DateFilterType;

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
}

export class LaboratoryEquipmentInfoDto {
  laboratoryEquipmentId: string;
  laboratoryId: string;
  laboratoryName: string;
  equipmentName: string;
}

export class FindAdminReservationDetailsResponseDto {
  reservationId: string;
  subscriberId: string;
  subscriptionDetailId: string;
  username: string;
  metadata: Record<string, any>;
  createdAt: string;
  reservationDate: string;
  reservationFinalDate: string | null;
  reservationLaboratoryEquipmentId: string;
  laboratoryEquipment: LaboratoryEquipmentInfoDto | null;
  initialHour: string;
  finalHour: string;
  duration: string;
  detailMetadata: Record<string, any>;
  status: StatusReservation;
}
