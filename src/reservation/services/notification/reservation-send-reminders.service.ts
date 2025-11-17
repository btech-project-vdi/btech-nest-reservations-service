import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ReservationLaboratoryEquipmentCustomService } from 'src/reservation-laboratory-equipment/services/custom/reservation-laboratory-equipment-custom.service';
import { ReservationValidateAlertLevelsService } from '../validation/reservation-validate-alert-levels.service';
import { ReservationSendAlertEmailService } from './reservation-send-alert-email.service';
import { SendReservationRemindersResponseDto } from 'src/reservation/dto/send-reservation-reminders-response.dto';

@Injectable()
export class ReservationSendRemindersService {
  private readonly logger = new Logger(ReservationSendRemindersService.name);

  constructor(
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCustomService))
    private readonly reservationLaboratoryEquipmentCustomService: ReservationLaboratoryEquipmentCustomService,
    private readonly reservationValidateAlertLevelsService: ReservationValidateAlertLevelsService,
    private readonly reservationSendAlertEmailService: ReservationSendAlertEmailService,
  ) {}

  async execute(
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
        this.reservationValidateAlertLevelsService.execute(
          subscriberIds,
          'ALE1',
        ),
        this.reservationValidateAlertLevelsService.execute(
          subscriberIds,
          'ALE2',
        ),
        this.reservationValidateAlertLevelsService.execute(
          subscriberIds,
          'ALE3',
        ),
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
              await this.reservationSendAlertEmailService.execute(
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
              await this.reservationSendAlertEmailService.execute(
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
              await this.reservationSendAlertEmailService.execute(
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
}
