import { Injectable } from '@nestjs/common';
import { ConcurrencyEquipmentValidateConcurrencyService } from './concurrency-equipment-validate-concurrency.service';
import { CheckConcurrencyDto } from '../../dto/check-concurrency.dto';

@Injectable()
export class ConcurrencyEquipmentValidationService {
  constructor(
    private readonly concurrencyEquipmentValidateConcurrencyService: ConcurrencyEquipmentValidateConcurrencyService,
  ) {}

  async validateReservationConcurrency(
    dto: CheckConcurrencyDto,
  ): Promise<void> {
    return await this.concurrencyEquipmentValidateConcurrencyService.execute(
      dto,
    );
  }
}
