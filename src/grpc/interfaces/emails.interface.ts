import { Observable } from 'rxjs';
import {
  SendLabReservationEmailDto,
  SendLabReservationEmailResponseDto,
} from '../dto/send-lab-reservation-email.dto';

export interface EmailsService {
  sendLabReservationEmail(
    request: SendLabReservationEmailDto,
  ): Observable<SendLabReservationEmailResponseDto>;
}
