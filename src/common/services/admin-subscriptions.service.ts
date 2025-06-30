import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import {
  FindActiveSubscriptionDetailsByBussinesIdDto,
  FindActiveSubscriptionDetailsByBussinesIdResponseDto,
} from '../dto/find-active-subscription-details-by-bussines-id.dto';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly client: MessagingService) {}
  async findActiveSubscriptionDetailsByBusinessId(
    findActiveSubscriptionDetailsByBussinesIdDto: FindActiveSubscriptionDetailsByBussinesIdDto,
  ): Promise<FindActiveSubscriptionDetailsByBussinesIdResponseDto[]> {
    return await this.client.send(
      'findActiveSubscriptionDetailsByBussinesId',
      findActiveSubscriptionDetailsByBussinesIdDto,
    );
  }
}
