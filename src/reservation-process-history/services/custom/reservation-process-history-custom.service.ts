import { Injectable } from '@nestjs/common';
import { ConfirmReservationDto } from 'src/reservation-process-history/dto/confirm-reservation.dto';
import { ConfirmListReservationDto } from 'src/reservation-process-history/dto/confirm-list-reservation.dto';
import { ReservationProcessHistoryConfirmReservationService } from './reservation-process-history-confirm-reservation.service';
import { ReservationProcessHistoryConfirmListService } from './reservation-process-history-confirm-list.service';

@Injectable()
export class ReservationProcessHistoryCustomService {
  constructor(
    private readonly reservationProcessHistoryConfirmReservationService: ReservationProcessHistoryConfirmReservationService,
    private readonly reservationProcessHistoryConfirmListService: ReservationProcessHistoryConfirmListService,
  ) {}

  async confirmReservation(
    confirmReservationDto: ConfirmReservationDto,
  ): Promise<{ message: string }> {
    return await this.reservationProcessHistoryConfirmReservationService.execute(
      confirmReservationDto,
    );
  }

  async confirmListReservation(
    confirmListReservationDto: ConfirmListReservationDto,
  ) {
    return await this.reservationProcessHistoryConfirmListService.execute(
      confirmListReservationDto,
    );
  }
}
