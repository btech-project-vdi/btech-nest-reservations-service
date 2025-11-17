import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindSubscribersWithNaturalPersonsDto extends PaginationDto {
  @IsString({
    message: 'El campo subscriptionDetailId debe ser una cadena de caracteres.',
  })
  @IsUUID('4', {
    message: 'El campo subscriptionDetailId debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'El campo subscriptionDetailId no puede estar vacío.',
  })
  subscriptionDetailId: string;

  @IsOptional()
  @IsString({
    message: 'El campo term debe ser una cadena de caracteres.',
  })
  term?: string;

  @IsOptional()
  @IsArray({
    message: 'El campo subscriberIds debe ser un arreglo.',
  })
  @IsString({
    each: true,
    message: 'Cada subscriberId debe ser una cadena de caracteres.',
  })
  subscriberIds?: string[];
}

export class PersonInformationResponseDto {
  informationType: string;
  description: string;
}

export class NaturalPersonCompleteInfoDto {
  naturalPersonId: string;
  personId: string;
  fullName: string;
  paternalSurname: string;
  maternalSurname: string;
  documentNumber: string;
  documentType: string;
  personInformation: PersonInformationResponseDto[];
}

export class SubscriberWithNaturalPersonDataDto {
  subscriberId: string;
  username: string;
  naturalPerson: NaturalPersonCompleteInfoDto | null;
}

export class FindSubscribersWithNaturalPersonsResponseDto {
  data: SubscriberWithNaturalPersonDataDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
