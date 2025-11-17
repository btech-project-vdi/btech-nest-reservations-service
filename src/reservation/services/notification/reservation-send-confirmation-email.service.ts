import { Injectable, Logger } from '@nestjs/common';
import { EmailsClient } from 'src/communications/grpc/clients/emails.client';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import {
  CreateReservationResponseDto,
  RequestMetadataDto,
} from 'src/reservation/dto/create-reservation.dto';
import { InformationSubscriberDto } from 'src/reservation/dto/information-subscriber.dto';
import { formatDateToSpanish } from 'src/reservation/helpers/format-date-to-spanish.helper';

@Injectable()
export class ReservationSendConfirmationEmailService {
  private readonly logger = new Logger(
    ReservationSendConfirmationEmailService.name,
  );

  constructor(private readonly emailsClient: EmailsClient) {}

  async execute(
    reservation: CreateReservationResponseDto,
    informationSubscriber: InformationSubscriberDto,
    equipmentMap: Map<
      string,
      FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto
    >,
    subscriptionDetailId: string,
    user?: SessionUserDataDto,
    requestMetadata?: RequestMetadataDto,
  ): Promise<void> {
    try {
      const { reservationLaboratoryEquipment } = reservation;

      const details = reservationLaboratoryEquipment.map((rle) => {
        const equipmentData = equipmentMap.get(rle.laboratoryEquipmentId);

        return {
          labDescription: equipmentData?.laboratory?.description || '',
          equipmentDescription: equipmentData?.equipment?.description || '',
          date: formatDateToSpanish(rle.reservationDate),
          startTime: rle.initialHour,
          endTime: rle.finalHour,
          metadata: rle.metadata,
          reservationLaboratoryEquipmentId:
            rle.reservationLaboratoryEquipmentId,
        };
      });
      await this.emailsClient.sendLabReservationEmail(
        {
          to: informationSubscriber.email,
          companyName: informationSubscriber.companyName,
          logoUrl: informationSubscriber.logoUrl,
          userName: informationSubscriber.subscriberName,
          reservationDate: formatDateToSpanish(reservation.createdAt),
          details,
          primaryColor: informationSubscriber.primaryColor,
          subscriptionDetailId,
        },
        {
          ipAddress: requestMetadata?.ipAddress,
          userAgent: requestMetadata?.userAgent,
          subscriberId: user?.subscriberId,
        },
      );
    } catch (error) {
      this.logger.error(
        'Error enviando correo de confirmación de reserva',
        error,
      );
    }
  }
}
