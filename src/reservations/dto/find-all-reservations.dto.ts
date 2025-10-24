import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusReservation } from '../enums/status-reservation.enum';
import { ReservationDetailFindAllResponseDto } from './reservation-detail-find-all.dto';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { Type } from 'class-transformer';

export class FindAllReservationsDto extends PaginationDto {
  @IsOptional()
  user: SessionUserDataDto;

  @IsOptional()
  @IsEnum(StatusReservation, { each: true })
  status?: StatusReservation | StatusReservation[];

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

export class FindAllReservationsResponseDto {
  reservationId: string;
  subscriberId: string;
  subscriptionDetailId: string;
  username: string;
  metadata: Record<string, any>;
  createdAt: string;
  reservationLaboratoryEquipment: ReservationDetailFindAllResponseDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
