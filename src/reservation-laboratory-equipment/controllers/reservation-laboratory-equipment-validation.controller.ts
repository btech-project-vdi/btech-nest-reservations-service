import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationLaboratoryEquipmentValidationService } from '../services/validation/reservation-laboratory-equipment-validation.service';
import { FindReservationsByEquipmentAndDateRangeDto } from 'src/reservation/dto/find-reservations-by-equipment-and-date-range.dto';

@Controller()
export class ReservationLaboratoryEquipmentValidationController {
  constructor(
    private readonly reservationLaboratoryEquipmentValidationService: ReservationLaboratoryEquipmentValidationService,
  ) {}

  @MessagePattern('reservations.findReservationsByEquipmentAndDateRange')
  findReservationsByEquipmentAndDateRange(
    @Payload()
    findReservationsByEquipmentAndDateRangeDto: FindReservationsByEquipmentAndDateRangeDto,
  ) {
    return this.reservationLaboratoryEquipmentValidationService.findReservationsByEquipmentAndDateRange(
      findReservationsByEquipmentAndDateRangeDto,
    );
  }
}
