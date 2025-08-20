/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import {
  SchedulableJob,
  JobContext,
} from '../interfaces/schedulable-job.interface';
import { JobExecutionResultDto } from '../dto/job-execution-result.dto';
import { JobStatus } from '../enums/job-status.enum';
import { ReservationsNotificationService } from '../../reservations/services/reservations-notification.service';

@Injectable()
export class SendReservationRemindersJob implements SchedulableJob {
  name = 'send-reservation-reminders';
  description =
    'Envía recordatorios por email a usuarios con reservas próximas';

  constructor(
    private readonly reservationsNotificationService: ReservationsNotificationService,
  ) {}

  async execute(context: JobContext): Promise<JobExecutionResultDto> {
    const startTime = Date.now();

    try {
      const result =
        await this.reservationsNotificationService.sendReservationReminders(
          context.timestamp,
        );
      return {
        success: true,
        status: JobStatus.SUCCESS,
        executionTime: Date.now() - startTime,
        data: result,
        affectedRows: result.sent,
      };
    } catch (error) {
      return {
        success: false,
        status: JobStatus.FAILED,
        executionTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }
}
