import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationLaboratoryEquipmentModule } from 'src/reservation-laboratory-equipment/reservation-laboratory-equipment.module';
import { ReservationProcessHistoryModule } from 'src/reservation-process-history/reservation-process-history.module';
import { CommonModule } from 'src/common/common.module';
import { GrpcModule } from 'src/communications/grpc/grpc.module';
import { ConcurrencyModule } from 'src/concurrency/concurrency.module';
import { RESERVATION_CORE_SERVICES } from './services/core';
import { RESERVATION_CUSTOM_SERVICES } from './services/custom';
import { RESERVATION_VALIDATION_SERVICES } from './services/validation';
import { RESERVATION_NOTIFICATION_SERVICES } from './services/notification';
import { RESERVATION_CONTROLLERS } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    forwardRef(() => ReservationLaboratoryEquipmentModule),
    forwardRef(() => ReservationProcessHistoryModule),
    CommonModule,
    GrpcModule,
    ConcurrencyModule,
  ],
  controllers: [...RESERVATION_CONTROLLERS],
  providers: [
    ...RESERVATION_CORE_SERVICES,
    ...RESERVATION_CUSTOM_SERVICES,
    ...RESERVATION_VALIDATION_SERVICES,
    ...RESERVATION_NOTIFICATION_SERVICES,
  ],
  exports: [
    ...RESERVATION_CORE_SERVICES,
    ...RESERVATION_CUSTOM_SERVICES,
    ...RESERVATION_VALIDATION_SERVICES,
    ...RESERVATION_NOTIFICATION_SERVICES,
  ],
})
export class ReservationModule {}
