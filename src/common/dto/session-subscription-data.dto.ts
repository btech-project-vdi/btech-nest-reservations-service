import { StatusSubscription } from 'src/common/enums/status-subscription.enum';

export class SessionSubscriptionDataDto {
  subscriptionId: string;
  subscriptionBussineId: string;
  status: StatusSubscription;
}
