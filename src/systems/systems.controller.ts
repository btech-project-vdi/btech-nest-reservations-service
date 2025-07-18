import { Controller } from '@nestjs/common';
import { SystemsService } from './systems.service';
import { ConfirmListReservationDto } from './dto/confirm-list-reservation.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';

@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}
  @MessagePattern('system.confirmListReservationSystems')
  async confirmListReservation(
    @Payload() confirmListReservationDto: ConfirmListReservationDto,
  ) {
    return await this.systemsService.confirmListReservation(
      confirmListReservationDto,
    );
  }

  @MessagePattern('system.confirmReservationSystems')
  async confirmReservation(
    @Payload() confirmReservationDto: ConfirmReservationDto,
  ) {
    return await this.systemsService.confirmReservation(confirmReservationDto);
  }
}
