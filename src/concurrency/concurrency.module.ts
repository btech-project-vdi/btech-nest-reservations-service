import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concurrency } from './entities/concurrency.entity';
import { ConcurrencyEquipment } from './entities/concurrency-equipment.entity';
import { ConcurrencyTimeSlot } from './entities/concurrency-time-slot.entity';
import { ConcurrencyLimit } from './entities/concurrency-limit.entity';
import { CONCURRENCY_CUSTOM_SERVICES } from './services/custom';
import { CONCURRENCY_VALIDATION_SERVICES } from './services/validation';
import { CONCURRENCY_CONTROLLERS } from './controllers';
import { ReservationLaboratoryEquipment } from 'src/reservation-laboratory-equipment/entities/reservation-laboratory-equipment.entity';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Concurrency,
      ConcurrencyEquipment,
      ConcurrencyTimeSlot,
      ConcurrencyLimit,
      ReservationLaboratoryEquipment,
    ]),
    forwardRef(() => ReservationModule),
  ],
  controllers: [...CONCURRENCY_CONTROLLERS],
  providers: [
    ...CONCURRENCY_CUSTOM_SERVICES,
    ...CONCURRENCY_VALIDATION_SERVICES,
  ],
  exports: [...CONCURRENCY_CUSTOM_SERVICES, ...CONCURRENCY_VALIDATION_SERVICES],
})
export class ConcurrencyModule {}
