import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ValidateRepeatedReservationDto } from '../dto/validate-repeated-reservation.dto';
import { ReservationValidationService } from '../services/validation/reservation-validation.service';

@Controller()
export class ReservationValidationController {
  constructor(
    private readonly reservationValidationService: ReservationValidationService,
  ) {}

  @MessagePattern('reservations.validateRepeatedReservation')
  validateRepeatedReservation(
    @Payload() validateDto: ValidateRepeatedReservationDto,
  ) {
    return this.reservationValidationService.validateRepeatedReservation(
      validateDto,
    );
  }
}
