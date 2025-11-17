import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulersService } from './schedulers.service';
import { SchedulersController } from './schedulers.controller';
import { CompleteFinishedReservationsJob } from './jobs/complete-finished-reservations.job';
import { SendReservationRemindersJob } from './jobs/send-reservation-reminders.job';
import { JobLoggerHelper } from './helpers/job-logger.helper';
import { ReservationModule } from 'src/reservation/reservation.module';
import { ReservationLaboratoryEquipmentModule } from 'src/reservation-laboratory-equipment/reservation-laboratory-equipment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ReservationModule,
    ReservationLaboratoryEquipmentModule,
  ],
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
