import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConcurrencyEquipmentValidationService } from '../services/validation/concurrency-equipment-validation.service';
import { CheckConcurrencyDto } from '../dto/check-concurrency.dto';

@Controller()
export class ConcurrencyEquipmentValidationController {
  constructor(
    private readonly concurrencyEquipmentValidationService: ConcurrencyEquipmentValidationService,
  ) {}

  @MessagePattern('concurrencyEquipment.validateReservationConcurrency')
  validateReservationConcurrency(@Payload() dto: CheckConcurrencyDto) {
    return this.concurrencyEquipmentValidationService.validateReservationConcurrency(
      dto,
    );
  }
}
