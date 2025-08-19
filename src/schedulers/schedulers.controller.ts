/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller } from '@nestjs/common';
import { SchedulersService } from './schedulers.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class SchedulersController {
  constructor(private readonly schedulersService: SchedulersService) {}

  @MessagePattern({ cmd: 'schedulers.execute' })
  async executeJobManually(data: { jobName: string }) {
    return await this.schedulersService.executeJobManually(data.jobName);
  }

  @MessagePattern({ cmd: 'schedulers.getAvailableJobs' })
  getAvailableJobs() {
    return {
      jobs: [
        {
          name: 'complete-finished-reservations',
          description:
            'Marca como completadas las reservas que han terminado su tiempo programado',
          frequency: 'Cada 5 minutos',
        },
      ],
    };
  }
}
