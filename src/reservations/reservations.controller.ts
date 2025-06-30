import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationsService } from './services/reservations.service';
import { ReservationLaboratoryEquipmentService } from './services/reservation-laboratory-equipment.service';
import { FindReservationsByEquipmentAndDateRangeDto } from './dto/find-reservations-by-equipment-and-date-range.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Controller()
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  @MessagePattern('createReservation')
  createReservation(@Payload() createReservationDto: CreateReservationDto) {
    return this.reservationsService.createReservation(
      createReservationDto.user,
      createReservationDto,
    );
  }

  @MessagePattern('updateReservationStatus')
  updateReservationStatus(
    @Payload()
    updateReservationStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationLaboratoryEquipmentService.updateStatus(
      updateReservationStatusDto,
    );
  }

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
