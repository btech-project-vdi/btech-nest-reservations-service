import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservationsModule } from '../reservations/reservations.module';
import { SchedulersService } from './schedulers.service';
import { SchedulersController } from './schedulers.controller';
import { CompleteFinishedReservationsJob } from './jobs/complete-finished-reservations.job';
import { SendReservationRemindersJob } from './jobs/send-reservation-reminders.job';
import { JobLoggerHelper } from './helpers/job-logger.helper';

@Module({
  imports: [ScheduleModule.forRoot(), ReservationsModule],
  controllers: [SchedulersController],
  providers: [
    SchedulersService,
    CompleteFinishedReservationsJob,
    SendReservationRemindersJob,
    JobLoggerHelper,
  ],
  exports: [
    SchedulersService,
    CompleteFinishedReservationsJob,
    SendReservationRemindersJob,
  ],
})
export class SchedulersModule {}
