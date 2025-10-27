import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConcurrencyController } from './concurrency.controller';
import { ConcurrencyService } from './services/concurrency.service';
import { ConcurrencyValidateService } from './services/concurrency-validate.service';
import { ConcurrencyCustomService } from './services/concurrency-custom.service';
import { Concurrency } from './entities/concurrency.entity';
import { ConcurrencyEquipment } from './entities/concurrency-equipment.entity';
import { ConcurrencyTimeSlot } from './entities/concurrency-time-slot.entity';
import { ConcurrencyLimit } from './entities/concurrency-limit.entity';
import { ReservationLaboratoryEquipment } from 'src/reservations/entities/reservation-laboratory-equipment.entity';
import { ReservationsModule } from 'src/reservations/reservations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Concurrency,
      ConcurrencyEquipment,
      ConcurrencyTimeSlot,
      ConcurrencyLimit,
      ReservationLaboratoryEquipment,
    ]),
    forwardRef(() => ReservationsModule),
  ],
  controllers: [ConcurrencyController],
  providers: [
    ConcurrencyService,
    ConcurrencyValidateService,
    ConcurrencyCustomService,
  ],
  exports: [
    ConcurrencyService,
    ConcurrencyValidateService,
    ConcurrencyCustomService,
  ],
})
export class ConcurrencyModule {}
