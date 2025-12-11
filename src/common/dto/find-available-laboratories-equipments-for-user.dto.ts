import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class FindAvailableLaboratoriesEquipmentsForUserDto extends PaginationDto {
  @IsUUID('all', { message: 'subscriptionDetailId debe ser un UUID válido' })
  subscriptionDetailId: string;

  @IsOptional()
  searchTerm?: string;

  @IsString({ message: 'subscriberId debe ser una cadena de texto' })
  subscriberId: string;
}

export class SystemSpecificationsResponseDto {
  attribute: string;
  resource: string;
}

export class ParameterResponseWithLaboratoryDto {
  parameterId: string;
  description: string;
  numberReservationDays: number;
  maxiumNumberMinutes: number;
  rangeBetweenReservations: number;
  reservationTime: string[];
}

export class FindAvailableLaboratoriesEquipmentsForUserResponseDto {
  laboratoryEquipmentId: string;
  laboratoryId: string;
  laboratoryName: string;
  equipmentName: string;
  quantity: number;
  programmingSubscriptionDetailId: string | null;
  programmingSubscriptionFinalDate: string | null;
  systemSpecifications: SystemSpecificationsResponseDto[];
  parameter?: ParameterResponseWithLaboratoryDto;
}
