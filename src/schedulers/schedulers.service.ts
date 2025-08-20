import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CompleteFinishedReservationsJob } from './jobs/complete-finished-reservations.job';
import { SendReservationRemindersJob } from './jobs/send-reservation-reminders.job';
import { JobLoggerHelper } from './helpers/job-logger.helper';
import { JobFrequency } from './enums/job-frequency.enum';
import { JobContext } from './interfaces/schedulable-job.interface';
import { getCurrentDateInTimezone } from './helpers/timezone.helper';

@Injectable()
export class SchedulersService {
  constructor(
    private readonly completeFinishedReservationsJob: CompleteFinishedReservationsJob,
    private readonly sendReservationRemindersJob: SendReservationRemindersJob,
    private readonly jobLogger: JobLoggerHelper,
  ) {
    this.jobLogger.logJobScheduled(
      this.completeFinishedReservationsJob.name,
      JobFrequency.EVERY_5_MINUTES,
    );
    this.jobLogger.logJobScheduled(
      this.sendReservationRemindersJob.name,
      JobFrequency.EVERY_5_MINUTES,
    );
  }

  @Cron(JobFrequency.EVERY_5_MINUTES, {
    name: 'complete-finished-reservations',
    timeZone: 'America/Lima',
  })
  async executeCompleteFinishedReservationsJob(): Promise<void> {
    this.jobLogger.logJobStart(this.completeFinishedReservationsJob.name);
    const context: JobContext = {
      timestamp: getCurrentDateInTimezone('America/Lima'),
      timezone: 'America/Lima',
      metadata: {
        triggeredBy: 'scheduler',
        executionId: Date.now(),
      },
    };
    const result = await this.completeFinishedReservationsJob.execute(context);
    this.jobLogger.logExecution(
      this.completeFinishedReservationsJob.name,
      result,
    );
  }

  // @Cron(JobFrequency.EVERY_5_MINUTES, {
  //   name: 'send-reservation-reminders',
  //   timeZone: 'America/Lima',
  // })
  // async executeSendReservationRemindersJob(): Promise<void> {
  //   this.jobLogger.logJobStart(this.sendReservationRemindersJob.name);
  //   const context: JobContext = {
  //     timestamp: getCurrentDateInTimezone('America/Lima'),
  //     timezone: 'America/Lima',
  //     metadata: {
  //       triggeredBy: 'scheduler',
  //       executionId: Date.now(),
  //     },
  //   };
  //   const result = await this.sendReservationRemindersJob.execute(context);
  //   this.jobLogger.logExecution(
  //     this.sendReservationRemindersJob.name,
  //     result,
  //   );
  // }

  async executeJobManually(jobName: string): Promise<any> {
    const context: JobContext = {
      timestamp: getCurrentDateInTimezone('America/Lima'),
      timezone: 'America/Lima',
      metadata: {
        triggeredBy: 'manual',
        executionId: Date.now(),
      },
    };

    switch (jobName) {
      case 'complete-finished-reservations':
        return await this.completeFinishedReservationsJob.execute(context);
      case 'send-reservation-reminders':
        return await this.sendReservationRemindersJob.execute(context);
      default:
        throw new Error(`Job "${jobName}" no encontrado`);
    }
  }
}
