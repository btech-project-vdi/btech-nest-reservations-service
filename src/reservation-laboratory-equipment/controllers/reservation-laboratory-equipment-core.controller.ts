import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationLaboratoryEquipmentCoreService } from '../services/core/reservation-laboratory-equipment-core.service';
import { UpdateReservationStatusDto } from 'src/reservation/dto/update-reservation-status.dto';
import { FindOneReservationLaboratoryEquipmentDto } from 'src/reservation/dto/find-one-reservation-laboratory-equipment.dto';

@Controller()
export class ReservationLaboratoryEquipmentCoreController {
  constructor(
    private readonly reservationLaboratoryEquipmentCoreService: ReservationLaboratoryEquipmentCoreService,
  ) {}

  @MessagePattern('reservationLaboratoryEquipment.updateStatus')
  updateReservationStatus(
    @Payload()
    updateReservationStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationLaboratoryEquipmentCoreService.updateStatus(
      updateReservationStatusDto,
    );
  }

  @MessagePattern('reservationLaboratoryEquipment.findOne')
  findOneReservationLaboratoryEquipment(
    @Payload()
    findOneReservationLaboratoryEquipmentDto: FindOneReservationLaboratoryEquipmentDto,
  ) {
    return this.reservationLaboratoryEquipmentCoreService.findOne(
      findOneReservationLaboratoryEquipmentDto.reservationLaboratoryEquipmentId,
    );
  }
}
