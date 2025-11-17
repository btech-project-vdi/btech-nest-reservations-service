import { Injectable, Logger } from '@nestjs/common';
import { SubscribersClient } from 'src/communications/grpc/clients/subscribers.client';
import { LevelAlertCode } from 'src/common/enums/level-alert-code.enum';

@Injectable()
export class ReservationValidateAlertLevelsService {
  private readonly logger = new Logger(
    ReservationValidateAlertLevelsService.name,
  );

  constructor(private readonly subscribersClient: SubscribersClient) {}

  async execute(
    subscriberIds: string[],
    levelAlertCode: string,
  ): Promise<
    Map<
      string,
      {
        hasAlertLevel: boolean;
        alertMinutesBefore?: number;
        subscriptionDetailId?: string;
      }
    >
  > {
    const resultMap = new Map<
      string,
      {
        hasAlertLevel: boolean;
        alertMinutesBefore?: number;
        subscriptionDetailId?: string;
      }
    >();

    if (subscriberIds.length === 0) return resultMap;

    try {
      const response =
        await this.subscribersClient.validateSubscriberAlertLevel({
          subscriberIds: subscriberIds,
          levelAlertCode: levelAlertCode as LevelAlertCode,
        });

      for (const validation of response.data || []) {
        resultMap.set(validation.subscriberId, {
          hasAlertLevel: validation.hasAlertLevel,
          alertMinutesBefore: validation.alertMinutesBefore,
          subscriptionDetailId: validation.subscriptionDetailId,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error validando nivel ${levelAlertCode} para subscribers`,
        error,
      );
    }

    return resultMap;
  }
}
