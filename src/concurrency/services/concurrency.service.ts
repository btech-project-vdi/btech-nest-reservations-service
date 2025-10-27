import { Injectable } from '@nestjs/common';
import { ConcurrencyValidateService } from './concurrency-validate.service';
import { CheckConcurrencyDto } from '../dto/check-concurrency.dto';

@Injectable()
export class ConcurrencyService {
  constructor(
    private readonly concurrencyValidateService: ConcurrencyValidateService,
  ) {}

  async validateReservationConcurrency(
    dto: CheckConcurrencyDto,
  ): Promise<void> {
    return await this.concurrencyValidateService.validateConcurrency(dto);
  }
}
