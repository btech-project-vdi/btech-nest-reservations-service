import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationProcessHistoryCustomService } from '../services/custom/reservation-process-history-custom.service';
import { ConfirmReservationDto } from 'src/reservation-process-history/dto/confirm-reservation.dto';
import { ConfirmListReservationDto } from 'src/reservation-process-history/dto/confirm-list-reservation.dto';

@Controller()
export class ReservationProcessHistoryCustomController {
  constructor(
    private readonly reservationProcessHistoryCustomService: ReservationProcessHistoryCustomService,
  ) {}

  @MessagePattern('reservationProcessHistory.confirmListReservation')
  async confirmListReservation(
    @Payload() confirmListReservationDto: ConfirmListReservationDto,
  ) {
    return await this.reservationProcessHistoryCustomService.confirmListReservation(
      confirmListReservationDto,
    );
  }

  @MessagePattern('reservationProcessHistory.confirmReservation')
  async confirmReservation(
    @Payload() confirmReservationDto: ConfirmReservationDto,
  ) {
    return await this.reservationProcessHistoryCustomService.confirmReservation(
      confirmReservationDto,
    );
  }
}
