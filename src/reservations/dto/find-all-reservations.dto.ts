import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusReservation } from '../enums/status-reservation.enum';
import { ReservationDetailFindAllResponseDto } from './reservation-detail-find-all.dto';
import { ValidateUserResponseDto } from 'src/common/dto/validate-user-response.dto';
import { mockUserData } from 'src/common/data/mock-user-data';

export class FindAllReservationsDto extends PaginationDto {
  @IsOptional()
  user: ValidateUserResponseDto = mockUserData;

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
