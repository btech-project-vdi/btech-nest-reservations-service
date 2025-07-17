import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import {
  CreateReservationDetailDto,
  CreateReservationDetailResponseDto,
} from './create-reservation-detail.dto';
import { SubscriberInfoDto } from 'src/common/dto/subscriber-info.dto';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';

export class CreateReservationDto {
  @IsOptional()
  user: SessionUserDataDto;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateReservationDetailDto)
  reservationDetails: CreateReservationDetailDto[];
}

export class CreateReservationResponseDto {
  reservationId: string;
  createdAt: string;
  subscriber: SubscriberInfoDto;
  metadata: Record<string, any>;
  reservationLaboratoryEquipment: CreateReservationDetailResponseDto[];
}
