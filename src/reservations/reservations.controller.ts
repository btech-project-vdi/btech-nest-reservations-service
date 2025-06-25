import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationsService } from './services/reservations.service';
import { ReservationLaboratoryEquipmentService } from './services/reservation-laboratory-equipment.service';
import { FindReservationsByEquipmentAndDateRangeDto } from './dto/find-reservations-by-equipment-and-date-range.dto';

@Controller()
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  @MessagePattern('findReservationsByEquipmentAndDateRange')
  findReservationsByEquipmentAndDateRange(
    @Payload()
    findReservationsByEquipmentAndDateRangeDto: FindReservationsByEquipmentAndDateRangeDto,
  ) {
    return this.reservationLaboratoryEquipmentService.findReservationsByEquipmentAndDateRange(
      findReservationsByEquipmentAndDateRangeDto,
    );
  }
}
