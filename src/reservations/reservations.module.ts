import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationLaboratoryEquipment } from './entities/reservation-laboratory-equipment.entity';
import { ReservationProcessHistory } from './entities/reservation-process-history.entity';
import { ReservationsService } from './services/reservations.service';
import { ReservationLaboratoryEquipmentService } from './services/reservation-laboratory-equipment.service';
import { CommonModule } from 'src/common/common.module';
import { ReservationProcessHistoryService } from './services/reservation-process-history.service';
import { GrpcModule } from '../grpc/grpc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationLaboratoryEquipment,
      ReservationProcessHistory,
    ]),
    CommonModule,
    GrpcModule,
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationLaboratoryEquipmentService,
    ReservationProcessHistoryService,
  ],
  exports: [
    ReservationsService,
    ReservationLaboratoryEquipmentService,
    ReservationProcessHistoryService,
  ],
})
export class ReservationsModule {}
