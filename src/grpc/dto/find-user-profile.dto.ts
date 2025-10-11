import { IsNotEmpty, IsString } from 'class-validator';

export class FindUserProfileDto {
  @IsString({
    message: 'El campo subscriberId debe ser una cadena de caracteres.',
  })
  @IsNotEmpty({
    message: 'El campo subscriberId no puede estar vacío.',
  })
  subscriberId: string;

  @IsString({
    message: 'El campo service debe ser una cadena de caracteres.',
  })
  @IsNotEmpty({
    message: 'El campo service no puede estar vacío.',
  })
  service: string;
}

export class PersonInformationDto {
  informationType: string;
  description: string;
}

export class NaturalPersonDto {
  naturalPersonId: string;
  personId: string;
  fullName: string;
  paternalSurname: string;
  maternalSurname: string;
  documentNumber: string;
  documentType: string;
  personInformation: PersonInformationDto[];
}

export class PersonInfoDto {
  personId: string;
  fullName: string;
}

export class SubscriptionInfoDto {
  subscriptionId: string;
  subscriptionBussineId: string;
  subscriptionDetailId: string;
  status: string;
  initialDate: string;
  finalDate: string;
  url?: string;
  person: PersonInfoDto;
}

export class UserProfileResponseDto {
  subscriberId: string;
  username: string;
  isTwoFactorEnabled: boolean;
  roles: string[];
  hasPassword: boolean;
  naturalPerson: NaturalPersonDto;
  subscription: SubscriptionInfoDto;
}
