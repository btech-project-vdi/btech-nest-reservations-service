import { Injectable } from '@nestjs/common';
import { ConcurrencyLimitFindApplicableService } from './concurrency-limit-find-applicable.service';
import { ConcurrencyLimit } from '../../entities/concurrency-limit.entity';

@Injectable()
export class ConcurrencyLimitCustomService {
  constructor(
    private readonly concurrencyLimitFindApplicableService: ConcurrencyLimitFindApplicableService,
  ) {}

  async findApplicableLimit(
    concurrencyId: string,
    reservationDate: string,
    initialHour: string,
    finalHour: string,
  ): Promise<ConcurrencyLimit | null> {
    return await this.concurrencyLimitFindApplicableService.execute(
      concurrencyId,
      reservationDate,
      initialHour,
      finalHour,
    );
  }
}
