export * from './reservation-send-confirmation-email.service';
export * from './reservation-send-cancellation-email.service';
export * from './reservation-send-alert-email.service';
export * from './reservation-send-reminders.service';
export * from './reservation-notification.service';

import { ReservationSendConfirmationEmailService } from './reservation-send-confirmation-email.service';
import { ReservationSendCancellationEmailService } from './reservation-send-cancellation-email.service';
import { ReservationSendAlertEmailService } from './reservation-send-alert-email.service';
import { ReservationSendRemindersService } from './reservation-send-reminders.service';
import { ReservationNotificationService } from './reservation-notification.service';

export const RESERVATION_NOTIFICATION_SERVICES = [
  ReservationSendConfirmationEmailService,
  ReservationSendCancellationEmailService,
  ReservationSendAlertEmailService,
  ReservationSendRemindersService,
  ReservationNotificationService,
];
