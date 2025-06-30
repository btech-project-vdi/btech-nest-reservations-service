import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationLaboratoryEquipment } from './entities/reservation-laboratory-equipment.entity';
import { ReservationProcessHistory } from './entities/reservation-process-history.entity';
import { ReservationsService } from './services/reservations.service';
import { ReservationLaboratoryEquipmentService } from './services/reservation-laboratory-equipment.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationLaboratoryEquipment,
      ReservationProcessHistory,
    ]),
    CommonModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationLaboratoryEquipmentService],
})
export class ReservationsModule {}
