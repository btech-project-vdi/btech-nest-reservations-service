import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FindAdminReservationsDto } from '../dto/find-admin-reservations.dto';
import { FindSubscribersListDto } from '../dto/find-subscribers-list.dto';
import { FindAvailableLaboratoriesEquipmentsForUserDto } from 'src/common/dto/find-available-laboratories-equipments-for-user.dto';
import { ReservationCustomService } from '../services/custom/reservation-custom.service';

@Controller()
export class ReservationCustomController {
  constructor(
    private readonly reservationCustomService: ReservationCustomService,
  ) {}

  @MessagePattern('reservations.findAdminReservations')
  findAdminReservations(
    @Payload() findAdminReservationsDto: FindAdminReservationsDto,
  ) {
    return this.reservationCustomService.findAdminReservations(
      findAdminReservationsDto,
    );
  }

  @MessagePattern('reservations.findSubscribersList')
  findSubscribersList(
    @Payload() findSubscribersListDto: FindSubscribersListDto,
  ) {
    return this.reservationCustomService.findSubscribersList(
      findSubscribersListDto,
    );
  }

  @MessagePattern('reservations.findAvailableLaboratoriesEquipmentsForUser')
  findAvailableLaboratoriesEquipmentsForUserWithReservations(
    @Payload()
    findAvailableLaboratoriesEquipmentsForUserDto: FindAvailableLaboratoriesEquipmentsForUserDto,
  ) {
    return this.reservationCustomService.findAvailableLaboratoriesEquipmentsForUserWithReservations(
      findAvailableLaboratoriesEquipmentsForUserDto,
    );
  }
}
