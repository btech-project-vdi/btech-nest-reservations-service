import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import {
  FindAvailableProgrammingHoursDto,
  FindAvailableProgrammingHoursResponseDto,
} from '../dto/find-available-programming-hours.dto';

@Injectable()
export class AdminProgrammingService {
  constructor(private readonly client: MessagingService) {}
  async findAvailableProgrammingHours(
    findAvailableProgrammingHoursDto: FindAvailableProgrammingHoursDto,
  ): Promise<FindAvailableProgrammingHoursResponseDto[]> {
    return await this.client.send(
      'findAvailableProgrammingHours',
      findAvailableProgrammingHoursDto,
    );
  }
}
