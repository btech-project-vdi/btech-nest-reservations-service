import { Injectable, Logger } from '@nestjs/common';
import { EmailsClient } from 'src/communications/grpc/clients/emails.client';
import { EmailNotificationMetadataDto } from 'src/communications/grpc/dto/send-lab-equipment-reservation-cancellation-email.dto';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { RequestMetadataDto } from 'src/reservation/dto/create-reservation.dto';

@Injectable()
export class ReservationSendCancellationEmailService {
  private readonly logger = new Logger(
    ReservationSendCancellationEmailService.name,
  );

  constructor(private readonly emailsClient: EmailsClient) {}

  async execute(
    reservationLaboratoryEquipmentId: string,
    metadata: EmailNotificationMetadataDto,
    subscriptionDetailId: string,
    reservationId: string,
    subscriberId?: string,
    user?: SessionUserDataDto,
    requestMetadata?: RequestMetadataDto,
  ): Promise<void> {
    try {
      await this.emailsClient.sendLabEquipmentReservationCancellationEmail(
        {
          reservationLaboratoryEquipmentId,
          metadata,
          subscriptionDetailId,
          reservationId,
        },
        {
          ipAddress: requestMetadata?.ipAddress,
          userAgent: requestMetadata?.userAgent,
          subscriberId,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error enviando correo de cancelación para reserva ${reservationLaboratoryEquipmentId}`,
        error,
      );
    }
  }
}
