import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservationsModule } from '../reservations/reservations.module';
import { SchedulersService } from './schedulers.service';
import { SchedulersController } from './schedulers.controller';
import { CompleteFinishedReservationsJob } from './jobs/complete-finished-reservations.job';
import { JobLoggerHelper } from './helpers/job-logger.helper';

@Module({
  imports: [ScheduleModule.forRoot(), ReservationsModule],
  controllers: [SchedulersController],
  providers: [
    SchedulersService,
    CompleteFinishedReservationsJob,
    JobLoggerHelper,
  ],
  exports: [SchedulersService, CompleteFinishedReservationsJob],
})
export class SchedulersModule {}
