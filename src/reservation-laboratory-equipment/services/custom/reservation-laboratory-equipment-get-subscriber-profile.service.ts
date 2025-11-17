import { Injectable } from '@nestjs/common';
import { SubscribersClient } from 'src/communications/grpc/clients/subscribers.client';

@Injectable()
export class ReservationLaboratoryEquipmentGetSubscriberProfileService {
  constructor(private readonly subscribersClient: SubscribersClient) {}

  async execute(
    subscriberId: string,
  ): Promise<Record<string, any> | undefined> {
    try {
      const userProfile = await this.subscribersClient.findUserProfile({
        subscriberId,
        service: 'VDI',
      });
      return userProfile ? (userProfile as Record<string, any>) : undefined;
    } catch (error) {
      console.error(
        'Error al obtener perfil del suscriptor desde gRPC:',
        error,
      );
      return undefined;
    }
  }
}
