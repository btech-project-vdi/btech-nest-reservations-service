import { LevelAlertCode } from 'src/common/enums/level-alert-code.enum';

export class ValidateSubscriberAlertLevelDto {
  subscriberIds: string[];
  levelAlertCode: LevelAlertCode;
}

export class SubscriberAlertLevelValidationDto {
  subscriberId: string;
  hasAlertLevel: boolean;
  alertMinutesBefore?: number;
  subscriptionDetailId?: string;
}

export class ValidateSubscriberAlertLevelResponseDto {
  data: SubscriberAlertLevelValidationDto[];
}
