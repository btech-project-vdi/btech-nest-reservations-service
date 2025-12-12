import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationLaboratoryEquipmentCustomService } from '../services/custom/reservation-laboratory-equipment-custom.service';
import { FindAdminReservationDetailsDto } from '../dto/find-admin-reservation-details.dto';
import { FindLaboratoriesWithReservationsDto } from '../dto/find-laboratories-with-reservations.dto';

@Controller()
export class ReservationLaboratoryEquipmentCustomController {
  constructor(
    private readonly reservationLaboratoryEquipmentCustomService: ReservationLaboratoryEquipmentCustomService,
  ) {}

  @MessagePattern('reservationLaboratoryEquipment.findAdminReservationDetails')
  findAdminReservationDetails(
    @Payload() findAdminReservationDetailsDto: FindAdminReservationDetailsDto,
  ) {
    return this.reservationLaboratoryEquipmentCustomService.findAdminReservationDetails(
      findAdminReservationDetailsDto,
    );
  }

  @MessagePattern(
    'reservationLaboratoryEquipment.findLaboratoriesWithReservations',
  )
  findLaboratoriesWithReservations(
    @Payload()
    findLaboratoriesWithReservationsDto: FindLaboratoriesWithReservationsDto,
  ) {
    return this.reservationLaboratoryEquipmentCustomService.findLaboratoriesWithReservations(
      findLaboratoriesWithReservationsDto,
    );
  }
}
