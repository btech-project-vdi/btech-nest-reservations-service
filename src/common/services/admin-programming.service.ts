import { Injectable } from '@nestjs/common';
import {
  FindAvailableProgrammingHoursDto,
  FindAvailableProgrammingHoursResponseDto,
} from '../dto/find-available-programming-hours.dto';
import { FindDaysWithDetailsDto } from '../dto/find-days-with-details.dto';
import { NatsService } from 'src/communications/nats';

@Injectable()
export class AdminProgrammingService {
  constructor(private readonly client: NatsService) {}
  async findAvailableProgrammingHours(
    findAvailableProgrammingHoursDto: FindAvailableProgrammingHoursDto,
  ): Promise<FindAvailableProgrammingHoursResponseDto[]> {
    return await this.client.send(
      'programmingHours.findAvailableProgrammingHours',
      findAvailableProgrammingHoursDto,
    );
  }

  async findDaysWithDetails(
    programmingSubscriptionDetailId: string,
  ): Promise<FindDaysWithDetailsDto[]> {
    return await this.client.send(
      'programmingDay.findProgrammingDaysWithDetails',
      {
        programmingSubscriptionDetailId,
      },
    );
  }
}
