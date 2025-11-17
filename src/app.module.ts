import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { SchedulersModule } from './schedulers/schedulers.module';
import { ConcurrencyModule } from './concurrency/concurrency.module';
import { ReservationProcessHistoryModule } from './reservation-process-history/reservation-process-history.module';
import { ReservationLaboratoryEquipmentModule } from './reservation-laboratory-equipment/reservation-laboratory-equipment.module';
import { ReservationModule } from './reservation/reservation.module';
import { CommunicationsModule } from './communications/communications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConcurrencyModule,
    ReservationProcessHistoryModule,
    ReservationLaboratoryEquipmentModule,
    ReservationModule,
    CommunicationsModule,
    SchedulersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
