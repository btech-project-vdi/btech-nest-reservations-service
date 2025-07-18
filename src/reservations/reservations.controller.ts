import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationsService } from './services/reservations.service';
import { ReservationLaboratoryEquipmentService } from './services/reservation-laboratory-equipment.service';
import { FindReservationsByEquipmentAndDateRangeDto } from './dto/find-reservations-by-equipment-and-date-range.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ValidateRepeatedReservationDto } from './dto/validate-repeated-reservation.dto';
import { FindAllReservationsDto } from './dto/find-all-reservations.dto';

@Controller()
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  @MessagePattern('reservations.createReservation')
  createReservation(@Payload() createReservationDto: CreateReservationDto) {
    return this.reservationsService.createReservation(
      createReservationDto.user,
      createReservationDto,
    );
  }

  @MessagePattern('reservations.findReservations')
  find(@Payload() findAllReservationsDto: FindAllReservationsDto) {
    return this.reservationsService.findAll(
      findAllReservationsDto.user,
      findAllReservationsDto,
    );
  }

  @MessagePattern('reservations.validateRepeatedReservation')
  validateRepeatedReservation(
    @Payload() validateDto: ValidateRepeatedReservationDto,
  ) {
    return this.reservationsService.validateRepeatedReservation(validateDto);
  }

  @MessagePattern('reservations.updateReservationStatus')
  updateReservationStatus(
    @Payload()
    updateReservationStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationLaboratoryEquipmentService.updateStatus(
      updateReservationStatusDto,
    );
  }

  @MessagePattern('reservations.findReservationsByEquipmentAndDateRange')
  findReservationsByEquipmentAndDateRange(
    @Payload()
    findReservationsByEquipmentAndDateRangeDto: FindReservationsByEquipmentAndDateRangeDto,
  ) {
    return this.reservationLaboratoryEquipmentService.findReservationsByEquipmentAndDateRange(
      findReservationsByEquipmentAndDateRangeDto,
    );
  }
}
