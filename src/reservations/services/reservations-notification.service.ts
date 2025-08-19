import { Injectable } from '@nestjs/common';
import { CreateReservationResponseDto } from '../dto/create-reservation.dto';
import { InformationSubscriberDto } from '../dto/information-subscriber.dto';
import { EmailsClient } from '../../grpc/clients/emails.client';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { formatDateToSpanish } from '../helpers/format-date-to-spanish.helper';

@Injectable()
export class ReservationsNotificationService {
  constructor(private readonly EmailsClient: EmailsClient) {}

  async sendEmailForConfirmationReservation(
    reservation: CreateReservationResponseDto,
    informationSubscriber: InformationSubscriberDto,
    equipmentMap: Map<
      string,
      FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto
    >,
  ) {
    const { reservationLaboratoryEquipment } = reservation;

    const details = reservationLaboratoryEquipment.map((rle) => {
      const equipmentData = equipmentMap.get(rle.laboratoryEquipmentId);

      return {
        labDescription: equipmentData?.laboratory?.description || '',
        equipmentDescription: equipmentData?.equipment?.description || '',
        date: formatDateToSpanish(rle.reservationDate),
        startTime: rle.initialHour,
        endTime: rle.finalHour,
      };
    });

    await this.EmailsClient.sendLabReservationEmail({
      to: informationSubscriber.email,
      companyName: informationSubscriber.companyName,
      logoUrl: informationSubscriber.logoUrl,
      userName: informationSubscriber.subscriberName,
      reservationDate: formatDateToSpanish(reservation.createdAt),
      details,
      primaryColor: informationSubscriber.primaryColor,
    });
  }
}
