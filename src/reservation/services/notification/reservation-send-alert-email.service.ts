import { Injectable, Logger } from '@nestjs/common';
import { EmailsClient } from 'src/communications/grpc/clients/emails.client';
import { ReservationLaboratoryEquipment } from 'src/reservation-laboratory-equipment/entities/reservation-laboratory-equipment.entity';
import { EmailNotificationDataDto } from 'src/communications/grpc/dto/send-lab-equipment-reservation-cancellation-email.dto';
import { ReservationFindEquipmentMapService } from '../custom';
import { formatDateToSpanish } from 'src/reservation/helpers/format-date-to-spanish.helper';

@Injectable()
export class ReservationSendAlertEmailService {
  private readonly logger = new Logger(ReservationSendAlertEmailService.name);

  constructor(
    private readonly emailsClient: EmailsClient,
    private readonly reservationFindEquipmentMapService: ReservationFindEquipmentMapService,
  ) {}

  async execute(
    reservationEquipment: ReservationLaboratoryEquipment,
    subscriberId: string,
    subscriptionDetailId: string | undefined,
    alertLevel: string,
    reminderMinutes: number,
  ): Promise<void> {
    const emailData: EmailNotificationDataDto | undefined = reservationEquipment
      .metadata?.emailNotificationData as EmailNotificationDataDto;
    if (!emailData) {
      this.logger.warn(
        `No hay emailNotificationData para reserva ${reservationEquipment.reservationLaboratoryEquipmentId}`,
      );
      return;
    }
    if (!subscriptionDetailId) {
      this.logger.warn(
        `No se encontró subscriptionDetailId para subscriber ${subscriberId}`,
      );
      return;
    }

    const equipmentMap = await this.reservationFindEquipmentMapService.execute([
      reservationEquipment.laboratoryEquipmentId,
    ]);
    const equipmentData = equipmentMap.get(
      reservationEquipment.laboratoryEquipmentId,
    );
    await this.emailsClient.sendLabReservationReminderEmail(
      {
        to: emailData.subscriberEmail || '',
        companyName: emailData.companyName || '',
        logoUrl: emailData.logoUrl || '',
        userName: emailData.subscriberName || '',
        reminderMinutes: reminderMinutes,
        reservationDate: formatDateToSpanish(
          reservationEquipment.reservationDate.toString(),
        ),
        startTime: reservationEquipment.initialHour,
        endTime: reservationEquipment.finalHour,
        labDescription: equipmentData?.laboratory?.description || 'Laboratorio',
        equipmentDescription: equipmentData?.equipment?.description || 'Equipo',
        primaryColor: emailData.primaryColor || '#007bff',
        subscriptionDetailId: subscriptionDetailId,
        reservationLaboratoryEquipmentId:
          reservationEquipment.reservationLaboratoryEquipmentId,
      },
      {
        subscriberId,
      },
    );
    this.logger.log(
      `Alerta ${alertLevel} enviada para reserva ${reservationEquipment.reservationLaboratoryEquipmentId}`,
    );
  }
}
