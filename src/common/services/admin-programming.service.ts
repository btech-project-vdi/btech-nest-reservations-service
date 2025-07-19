import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import {
  FindAvailableProgrammingHoursDto,
  FindAvailableProgrammingHoursResponseDto,
} from '../dto/find-available-programming-hours.dto';
import { FindDaysWithDetailsDto } from '../dto/find-days-with-details.dto';

@Injectable()
export class AdminProgrammingService {
  constructor(private readonly client: MessagingService) {}
  async findAvailableProgrammingHours(
    findAvailableProgrammingHoursDto: FindAvailableProgrammingHoursDto,
  ): Promise<FindAvailableProgrammingHoursResponseDto[]> {
    return await this.client.send(
      'programming.findAvailableProgrammingHours',
      findAvailableProgrammingHoursDto,
    );
  }

  async findDaysWithDetails(
    programmingSubscriptionDetailId: string,
  ): Promise<FindDaysWithDetailsDto[]> {
    return await this.client.send(
      'programming.findProgrammingDaysWithDetails',
      {
        programmingSubscriptionDetailId,
      },
    );
  }
}
