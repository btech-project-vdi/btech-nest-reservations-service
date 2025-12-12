import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TimePeriod } from 'src/reservation/enums/time-period.enum';
import { DateFilterType } from 'src/reservation/enums/date-filter-type.enum';

export class FindLaboratoriesWithReservationsDto extends PaginationDto {
  @IsString({ message: 'subscriptionDetailId debe ser un UUID válido' })
  subscriptionDetailId: string;

  @IsOptional()
  @IsString({ message: 'searchTerm debe ser un string' })
  searchTerm?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsEnum(TimePeriod, { message: 'timePeriod debe ser un valor válido' })
  timePeriod?: TimePeriod;

  @IsOptional()
  @IsEnum(DateFilterType, { message: 'dateFilterType debe ser un valor válido' })
  dateFilterType?: DateFilterType;

  @IsOptional()
  @IsString({ message: 'startDate debe ser un string' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'endDate debe ser un string' })
  endDate?: string;

  @IsOptional()
  @IsString({ message: 'startTime debe ser un string' })
  startTime?: string;

  @IsOptional()
  @IsString({ message: 'endTime debe ser un string' })
  endTime?: string;
}

export class FindLaboratoriesWithReservationsResponseDto {
  laboratoryEquipmentId: string;
  laboratoryId: string;
  laboratoryName: string;
  quantity: number;
  isActive: boolean;
  reservationCount: number;
}
