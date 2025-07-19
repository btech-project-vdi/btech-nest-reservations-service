import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SubscriberInfoDto } from 'src/common/dto/subscriber-info.dto';
import { LaboratoryEquipmentFindAllResponseDto } from 'src/reservations/dto/reservation-detail-find-all.dto';
import { StatusReservation } from 'src/reservations/enums/status-reservation.enum';

export class ConfirmListReservationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(StatusReservation, {
    message: 'La reserva debe ser una de las opciones válidas',
  })
  status?: StatusReservation;
}

export class ConfirmListReservationResponseDto {
  reservationLaboratoryEquipmentId: string;
  createdAt: string;
  subscriber?: SubscriberInfoDto;
  laboratoryEquipment: LaboratoryEquipmentFindAllResponseDto;
  reservationDate: string;
  reservationFinalDate: string;
  initialHour: string;
  finalHour: string;
  metadata?: Record<string, string>;
  status: string;
}
