import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationProcessHistory } from './entities/reservation-process-history.entity';
import { RESERVATION_PROCESS_HISTORY_CORE_SERVICES } from './services/core';
import { RESERVATION_PROCESS_HISTORY_CUSTOM_SERVICES } from './services/custom';
import { RESERVATION_PROCESS_HISTORY_CONTROLLERS } from './controllers';
import { ReservationModule } from 'src/reservation/reservation.module';
import { ReservationLaboratoryEquipmentModule } from 'src/reservation-laboratory-equipment/reservation-laboratory-equipment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationProcessHistory]),
    forwardRef(() => ReservationModule),
    forwardRef(() => ReservationLaboratoryEquipmentModule),
  ],
  controllers: [...RESERVATION_PROCESS_HISTORY_CONTROLLERS],
  providers: [
    ...RESERVATION_PROCESS_HISTORY_CORE_SERVICES,
    ...RESERVATION_PROCESS_HISTORY_CUSTOM_SERVICES,
  ],
  exports: [
    ...RESERVATION_PROCESS_HISTORY_CORE_SERVICES,
    ...RESERVATION_PROCESS_HISTORY_CUSTOM_SERVICES,
  ],
})
export class ReservationProcessHistoryModule {}
