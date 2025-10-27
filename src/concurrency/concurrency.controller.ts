import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConcurrencyService } from './services/concurrency.service';
import { CheckConcurrencyDto } from './dto/check-concurrency.dto';

@Controller()
export class ConcurrencyController {
  constructor(private readonly concurrencyService: ConcurrencyService) {}

  @MessagePattern('concurrency.validateReservationConcurrency')
  validateReservationConcurrency(@Payload() dto: CheckConcurrencyDto) {
    return this.concurrencyService.validateReservationConcurrency(dto);
  }
}
