import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateReservationResponseDto } from '../dto/create-reservation.dto';
import { InformationSubscriberDto } from '../dto/information-subscriber.dto';
import { EmailsClient } from '../../grpc/clients/emails.client';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { formatDateToSpanish } from '../helpers/format-date-to-spanish.helper';
import { ReservationLaboratoryEquipmentCustomService } from './reservation-laboratory-equipment-custom.service';
import { ReservationLaboratoryEquipmentCoreService } from './reservation-laboratory-equipment-core.service';
import { ReservationsCoreService } from './reservations-core.service';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { SendReservationRemindersResponseDto } from '../dto/send-reservation-reminders-response.dto';
import { EmailNotificationMetadataDto } from 'src/grpc/dto/send-lab-equipment-reservation-cancellation-email.dto';

@Injectable()
export class ReservationsNotificationService {
  private readonly logger = new Logger(ReservationsNotificationService.name);

  constructor(
    private readonly emailsClient: EmailsClient,
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCustomService))
    private readonly reservationLaboratoryEquipmentCustomService: ReservationLaboratoryEquipmentCustomService,
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCoreService))
    private readonly reservationLaboratoryEquipmentCoreService: ReservationLaboratoryEquipmentCoreService,
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
    subscriptionDetailId: string,
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
        subscriptionDetailId,
      });
    } catch (error) {
      this.logger.error(
        'Error enviando correo de confirmación de reserva',
        error,
      );
    }
  }

  async sendCancellationEmail(
    reservationLaboratoryEquipmentId: string,
    metadata: EmailNotificationMetadataDto,
    subscriptionDetailId: string,
  ): Promise<void> {
    try {
      await this.emailsClient.sendLabEquipmentReservationCancellationEmail({
        reservationLaboratoryEquipmentId,
        metadata,
        subscriptionDetailId,
      });
    } catch (error) {
      this.logger.error(
        `Error enviando correo de cancelación para reserva ${reservationLaboratoryEquipmentId}`,
        error,
      );
    }
  }

  async sendReservationReminders(
    currentDateTime: Date,
  ): Promise<SendReservationRemindersResponseDto> {
    const upcomingReservations =
      await this.reservationLaboratoryEquipmentCustomService.findReservationsForReminder();
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
          await this.reservationLaboratoryEquipmentCoreService.markReminderEmailSent(
            reservationEquipment.reservationLaboratoryEquipmentId,
          );
          sent++;
        }
      } catch (error) {
        this.logger.error(
          `Error enviando recordatorio para reserva ${reservationEquipment.reservationLaboratoryEquipmentId}`,
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
