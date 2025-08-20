import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateReservationResponseDto } from '../dto/create-reservation.dto';
import { InformationSubscriberDto } from '../dto/information-subscriber.dto';
import { EmailsClient } from '../../grpc/clients/emails.client';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { formatDateToSpanish } from '../helpers/format-date-to-spanish.helper';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';
import { ReservationsCoreService } from './reservations-core.service';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { SendReservationRemindersResponseDto } from '../dto/send-reservation-reminders-response.dto';

@Injectable()
export class ReservationsNotificationService {
  constructor(
    private readonly emailsClient: EmailsClient,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
    @Inject(forwardRef(() => ReservationsCoreService))
    private readonly reservationsCoreService: ReservationsCoreService,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
  ) {}

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

    await this.emailsClient.sendLabReservationEmail({
      to: informationSubscriber.email,
      companyName: informationSubscriber.companyName,
      logoUrl: informationSubscriber.logoUrl,
      userName: informationSubscriber.subscriberName,
      reservationDate: formatDateToSpanish(reservation.createdAt),
      details,
      primaryColor: informationSubscriber.primaryColor,
    });
  }

  async sendReservationReminders(
    currentDateTime: Date,
  ): Promise<SendReservationRemindersResponseDto> {
    const upcomingReservations =
      await this.reservationLaboratoryEquipmentService.findReservationsForReminder();
    let processed = 0;
    let sent = 0;
    for (const reservationEquipment of upcomingReservations) {
      processed++;
      try {
        // Obtener configuración de minutos de recordatorio
        const reminderConfig =
          await this.adminLaboratoriesService.findReminderMinutesByLaboratoryEquipmentId(
            reservationEquipment.laboratoryEquipmentId,
          );
        if (!reminderConfig?.reminderMinutesBefore) continue;
        const [hours, minutes] = reservationEquipment.initialHour
          .split(':')
          .map(Number);
        const reservationDateTime = new Date(
          reservationEquipment.reservationDate,
        );
        reservationDateTime.setHours(hours, minutes, 0, 0);
        const reminderTime = new Date(reservationDateTime);
        reminderTime.setMinutes(
          reminderTime.getMinutes() - reminderConfig.reminderMinutesBefore,
        );
        const now = currentDateTime;

        if (now >= reminderTime && now < reservationDateTime) {
          // Obtener información del equipo y laboratorio
          const equipmentMap =
            await this.reservationsCoreService.findEquipmentMapData([
              reservationEquipment.laboratoryEquipmentId,
            ]);
          const equipmentData = equipmentMap.get(
            reservationEquipment.laboratoryEquipmentId,
          );

          await this.emailsClient.sendLabReservationReminderEmail({
            to: 'usuario@ejemplo.com',
            companyName: 'BTECH Company',
            logoUrl: 'https://ejemplo.com/logo.png',
            userName: 'Usuario de Ejemplo',
            reminderMinutes: reminderConfig.reminderMinutesBefore,
            reservationDate: formatDateToSpanish(
              reservationEquipment.reservationDate.toString(),
            ),
            startTime: reservationEquipment.initialHour,
            endTime: reservationEquipment.finalHour,
            labDescription:
              equipmentData?.laboratory?.description || 'Laboratorio',
            equipmentDescription:
              equipmentData?.equipment?.description || 'Equipo',
            primaryColor: '#007bff',
          });
          await this.reservationLaboratoryEquipmentService.markReminderEmailSent(
            reservationEquipment.reservationLaboratoryEquipmentId,
          );
          sent++;
        }
      } catch (error) {
        console.error(
          `Error enviando recordatorio para reserva ${reservationEquipment.reservationLaboratoryEquipmentId}:`,
          error,
        );
      }
    }
    return {
      processed,
      sent,
      executedAt: currentDateTime,
      message: `Recordatorios procesados: ${processed}, enviados: ${sent}`,
    };
  }
}
