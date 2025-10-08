import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateReservationResponseDto } from '../dto/create-reservation.dto';
import { InformationSubscriberDto } from '../dto/information-subscriber.dto';
import { EmailsClient } from '../../grpc/clients/emails.client';
import { SubscribersClient } from '../../grpc/clients/subscribers.client';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { formatDateToSpanish } from '../helpers/format-date-to-spanish.helper';
import { ReservationLaboratoryEquipmentCustomService } from './reservation-laboratory-equipment-custom.service';
import { ReservationsCoreService } from './reservations-core.service';
import { SendReservationRemindersResponseDto } from '../dto/send-reservation-reminders-response.dto';
import {
  EmailNotificationMetadataDto,
  EmailNotificationDataDto,
} from 'src/grpc/dto/send-lab-equipment-reservation-cancellation-email.dto';
import { LevelAlertCode } from 'src/common/enums/level-alert-code.enum';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';

@Injectable()
export class ReservationsNotificationService {
  private readonly logger = new Logger(ReservationsNotificationService.name);

  constructor(
    private readonly emailsClient: EmailsClient,
    private readonly subscribersClient: SubscribersClient,
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCustomService))
    private readonly reservationLaboratoryEquipmentCustomService: ReservationLaboratoryEquipmentCustomService,
    @Inject(forwardRef(() => ReservationsCoreService))
    private readonly reservationsCoreService: ReservationsCoreService,
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
    let sentALE1 = 0;
    let sentALE2 = 0;
    let sentALE3 = 0;

    // Agrupar por subscriberId para hacer batch de validaciones
    const reservationsBySubscriber = new Map<
      string,
      typeof upcomingReservations
    >();
    for (const reservation of upcomingReservations) {
      const subscriberId = reservation.reservation?.subscriberId;
      if (!subscriberId) continue;

      if (!reservationsBySubscriber.has(subscriberId)) {
        reservationsBySubscriber.set(subscriberId, []);
      }
      reservationsBySubscriber.get(subscriberId)?.push(reservation);
    }

    // Obtener todos los subscriberIds únicos
    const subscriberIds = Array.from(reservationsBySubscriber.keys());

    // Validar niveles de alerta para todos los subscribers de una sola vez
    const [ale1Validations, ale2Validations, ale3Validations] =
      await Promise.all([
        this.validateAlertLevels(subscriberIds, 'ALE1'),
        this.validateAlertLevels(subscriberIds, 'ALE2'),
        this.validateAlertLevels(subscriberIds, 'ALE3'),
      ]);

    for (const [subscriberId, reservations] of reservationsBySubscriber) {
      try {
        const ale1Config = ale1Validations.get(subscriberId);
        const ale2Config = ale2Validations.get(subscriberId);
        const ale3Config = ale3Validations.get(subscriberId);

        for (const reservationEquipment of reservations) {
          processed++;
          try {
            const [hours, minutes] = reservationEquipment.initialHour
              .split(':')
              .map(Number);
            const reservationDateTime = new Date(
              reservationEquipment.reservationDate,
            );
            reservationDateTime.setHours(hours, minutes, 0, 0);

            const minutesUntilReservation = Math.floor(
              (reservationDateTime.getTime() - currentDateTime.getTime()) /
                60000,
            );
            // Evaluar ALE1 (rango basado en minutos configurados)
            if (
              ale1Config?.hasAlertLevel &&
              ale1Config.alertMinutesBefore &&
              minutesUntilReservation > ale1Config.alertMinutesBefore - 10 &&
              minutesUntilReservation <= ale1Config.alertMinutesBefore
            ) {
              await this.sendAlertEmail(
                reservationEquipment,
                subscriberId,
                ale1Config.subscriptionDetailId,
                'ALE1',
                ale1Config.alertMinutesBefore,
              );
              sentALE1++;
              continue;
            }

            // Evaluar ALE2
            if (
              ale2Config?.hasAlertLevel &&
              ale2Config.alertMinutesBefore &&
              minutesUntilReservation > ale2Config.alertMinutesBefore - 10 &&
              minutesUntilReservation <= ale2Config.alertMinutesBefore
            ) {
              await this.sendAlertEmail(
                reservationEquipment,
                subscriberId,
                ale2Config.subscriptionDetailId,
                'ALE2',
                ale2Config.alertMinutesBefore,
              );
              sentALE2++;
              continue;
            }

            // Evaluar ALE3
            if (
              ale3Config?.hasAlertLevel &&
              ale3Config.alertMinutesBefore &&
              minutesUntilReservation > ale3Config.alertMinutesBefore - 10 &&
              minutesUntilReservation <= ale3Config.alertMinutesBefore
            ) {
              await this.sendAlertEmail(
                reservationEquipment,
                subscriberId,
                ale3Config.subscriptionDetailId,
                'ALE3',
                ale3Config.alertMinutesBefore,
              );
              sentALE3++;
            }
          } catch (error) {
            this.logger.error(
              `Error procesando reserva ${reservationEquipment.reservationLaboratoryEquipmentId}`,
              error,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Error validando niveles de alerta para subscriber ${subscriberId}`,
          error,
        );
      }
    }

    const totalSent = sentALE1 + sentALE2 + sentALE3;
    return {
      processed,
      sentALE1,
      sentALE2,
      sentALE3,
      totalSent,
      executedAt: currentDateTime,
      message: `Procesados: ${processed}, Enviados: ALE1=${sentALE1}, ALE2=${sentALE2}, ALE3=${sentALE3}, Total=${totalSent}`,
    };
  }

  private async validateAlertLevels(
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

  private async sendAlertEmail(
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
    const equipmentMap =
      await this.reservationsCoreService.findEquipmentMapData([
        reservationEquipment.laboratoryEquipmentId,
      ]);
    const equipmentData = equipmentMap.get(
      reservationEquipment.laboratoryEquipmentId,
    );
    await this.emailsClient.sendLabReservationReminderEmail({
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
    });
    this.logger.log(
      `Alerta ${alertLevel} enviada para reserva ${reservationEquipment.reservationLaboratoryEquipmentId}`,
    );
  }
}
