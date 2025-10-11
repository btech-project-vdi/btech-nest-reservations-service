import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import {
  CreateReservationDetailDto,
  CreateReservationDetailResponseDto,
} from './create-reservation-detail.dto';
import { SubscriberInfoDto } from 'src/common/dto/subscriber-info.dto';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { InformationSubscriberDto } from './information-subscriber.dto';

export class RequestMetadataDto {
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class CreateReservationDto {
  @IsOptional()
  user: SessionUserDataDto;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => RequestMetadataDto)
  requestMetadata?: RequestMetadataDto;

  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateReservationDetailDto)
  reservationDetails: CreateReservationDetailDto[];

  @ValidateNested({
    message:
      'La información del suscriptor es requerida y debe ser un objeto válido.',
  })
  @Type(() => InformationSubscriberDto)
  informationSubscriber: InformationSubscriberDto;
}

export class CreateReservationResponseDto {
  reservationId: string;
  createdAt: string;
  subscriber: SubscriberInfoDto;
  metadata: Record<string, any>;
  reservationLaboratoryEquipment: CreateReservationDetailResponseDto[];
}
