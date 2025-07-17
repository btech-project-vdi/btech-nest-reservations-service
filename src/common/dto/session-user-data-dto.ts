import { SessionSubscriptionDataDto } from './session-subscription-data.dto';

export class SessionUserDataDto {
  sessionId: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  subscriberId: string;
  username: string;
  isTwoFactorEnabled: boolean;
  roles: string[];
  subscription: SessionSubscriptionDataDto;
  isActive: boolean;
}
