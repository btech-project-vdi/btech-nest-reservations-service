import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly client: MessagingService) {}
  async findLaboratoriesSubscriptionDetailsIdsBySubscriptionDetailId(
    subscriptionDetailId: string,
  ): Promise<string[]> {
    return await this.client.send(
      'laboratoriesSubscriptionDetail.findIdsBySubscriptionDetailId',
      { subscriptionDetailId },
    );
  }
}
