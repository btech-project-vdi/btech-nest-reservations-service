import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @MessagePattern('createReservation')
  create(@Payload() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @MessagePattern('findAllReservations')
  findAll() {
    return this.reservationsService.findAll();
  }

  @MessagePattern('findOneReservation')
  findOne(@Payload() id: number) {
    return this.reservationsService.findOne(id);
  }

  @MessagePattern('updateReservation')
  update(@Payload() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(updateReservationDto.id, updateReservationDto);
  }

  @MessagePattern('removeReservation')
  remove(@Payload() id: number) {
    return this.reservationsService.remove(id);
  }
}
