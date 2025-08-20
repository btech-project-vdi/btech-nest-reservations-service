import { Observable } from 'rxjs';
import {
  SendLabReservationEmailDto,
  SendLabReservationEmailResponseDto,
} from '../dto/send-lab-reservation-email.dto';
import { SendLabReservationReminderEmailDto } from '../dto/send-lab-reservation-reminder-email.dto';

export interface EmailsService {
  sendLabReservationEmail(
    request: SendLabReservationEmailDto,
  ): Observable<SendLabReservationEmailResponseDto>;

  sendLabReservationReminderEmail(
    request: SendLabReservationReminderEmailDto,
  ): Observable<SendLabReservationEmailResponseDto>;
}
