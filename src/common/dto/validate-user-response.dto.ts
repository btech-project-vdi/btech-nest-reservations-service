import { StatusSubscription } from '../enums/status-subscription.enum';

export class ValidateUserResponseDto {
  subscriberId: string;
  username: string;
  isTwoFactorEnabled: boolean;
  roles: string[];
  naturalPerson: NaturalPersonResponseDto;
  subscription: SubscriptionResponseDto;
}

export class NaturalPersonResponseDto {
  naturalPersonId: string;
  personId: string;
  fullName: string;
  paternalSurname: string;
  maternalSurname: string;
  documentNumber: string;
  documentType: string;
  personInformation: PersonInformationResponseDto[];
}

export class PersonInformationResponseDto {
  informationType: string;
  description: string;
}

export class SubscriptionResponseDto {
  subscriptionId: string;
  subscriptionBussineId: string;
  status: StatusSubscription;
  initialDate: string;
  finalDate: string;
  url?: string | null;
  // parameter: ParameterResponseDto;
  subscriptionDesign: SubscriptionsDesigneSettingsResponseDto;
  person: any;
}

export class SubscriptionsDesigneSettingsResponseDto {
  subscriptionsDesigneSettingId: string | undefined;
  url: string | undefined;
  brandOne: string | undefined;
  brandTwo: string | undefined;
  brandThree: string | undefined;
  brandFour: string | undefined;
  primaryColor: string | undefined;
  secondaryColor: string | undefined;
  baseColor: string | undefined;
  infoColor: string | undefined;
  warningColor: string | undefined;
  successColor: string | undefined;
  errorColor: string | undefined;
  lightColor: string | undefined;
  darkColor: string | undefined;
  letterFont: string | undefined;
}
