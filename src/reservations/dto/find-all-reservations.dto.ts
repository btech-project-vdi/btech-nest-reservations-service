import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusReservation } from '../enums/status-reservation.enum';
import { ReservationDetailFindAllResponseDto } from './reservation-detail-find-all.dto';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';

export class FindAllReservationsDto extends PaginationDto {
  @IsOptional()
  user: SessionUserDataDto;

  @IsOptional()
  @IsEnum(StatusReservation, { each: true })
  status?: StatusReservation | StatusReservation[];
}

export class FindAllReservationsResponseDto {
  reservationId: string;
  subscriberId: string;
  username: string;
  metadata: Record<string, any>;
  createdAt: string;
  reservationLaboratoryEquipment: ReservationDetailFindAllResponseDto[];
}
