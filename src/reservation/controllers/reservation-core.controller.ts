import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { FindAllReservationsDto } from '../dto/find-all-reservations.dto';
import { ReservationCoreService } from '../services/core/reservation-core.service';

@Controller()
export class ReservationCoreController {
  constructor(
    private readonly reservationCoreService: ReservationCoreService,
  ) {}

  @MessagePattern('reservations.createReservation')
  createReservation(@Payload() createReservationDto: CreateReservationDto) {
    return this.reservationCoreService.createReservation(
      createReservationDto.user,
      createReservationDto,
    );
  }

  @MessagePattern('reservations.findReservations')
  find(@Payload() findAllReservationsDto: FindAllReservationsDto) {
    return this.reservationCoreService.findAll(
      findAllReservationsDto.user,
      findAllReservationsDto,
    );
  }
}
