import { Injectable } from '@nestjs/common';
import { ConcurrencyEquipmentCountReservationsInGroupService } from './concurrency-equipment-count-reservations-in-group.service';
import { CountReservationsInGroupDto } from '../../dto/count-reservations-in-group.dto';

@Injectable()
export class ConcurrencyEquipmentCustomService {
  constructor(
    private readonly concurrencyEquipmentCountReservationsInGroupService: ConcurrencyEquipmentCountReservationsInGroupService,
  ) {}

  async countReservationsInGroupByTimeRange(
    dto: CountReservationsInGroupDto,
  ): Promise<number> {
    return await this.concurrencyEquipmentCountReservationsInGroupService.execute(
      dto,
    );
  }
}
