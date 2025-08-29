import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationsService } from './services/reservations.service';
import { ReservationLaboratoryEquipmentService } from './services/reservation-laboratory-equipment.service';
import { FindReservationsByEquipmentAndDateRangeDto } from './dto/find-reservations-by-equipment-and-date-range.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ValidateRepeatedReservationDto } from './dto/validate-repeated-reservation.dto';
import { FindAllReservationsDto } from './dto/find-all-reservations.dto';
import { ReservationsAdminService } from './services/reservations-admin.service';
import { FindAdminReservationsDto } from './dto/find-admin-reservations.dto';
import { FindSubscribersListDto } from './dto/find-subscribers-list.dto';
import { FindAvailableLaboratoriesEquipmentsForUserDto } from 'src/common/dto/find-available-laboratories-equipments-for-user.dto';

@Controller()
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
    private readonly reservationsAdminService: ReservationsAdminService,
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

  @MessagePattern('reservations.findAdminReservations')
  findAdminReservations(
    @Payload() findAdminReservationsDto: FindAdminReservationsDto,
  ) {
    return this.reservationsAdminService.findAdminReservations(
      findAdminReservationsDto,
    );
  }

  @MessagePattern('reservations.findSubscribersList')
  findSubscribersList(
    @Payload() findSubscribersListDto: FindSubscribersListDto,
  ) {
    return this.reservationsAdminService.findSubscribersList(
      findSubscribersListDto,
    );
  }

  @MessagePattern('reservations.findAvailableLaboratoriesEquipmentsForUser')
  findAvailableLaboratoriesEquipmentsForUserWithReservations(
    @Payload()
    findAvailableLaboratoriesEquipmentsForUserDto: FindAvailableLaboratoriesEquipmentsForUserDto,
  ) {
    return this.reservationsAdminService.findAvailableLaboratoriesEquipmentsForUserWithReservations(
      findAvailableLaboratoriesEquipmentsForUserDto,
    );
  }
}
