import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationLaboratoryEquipment } from './entities/reservation-laboratory-equipment.entity';
import { ReservationProcessHistory } from './entities/reservation-process-history.entity';
import { ReservationsService } from './services/reservations.service';
import { CommonModule } from 'src/common/common.module';
import { ReservationProcessHistoryService } from './services/reservation-process-history.service';
import { ReservationsValidationService } from './services/reservations-validation.service';
import { ReservationsAvailabilityService } from './services/reservations-availability.service';
import { ReservationsNotificationService } from './services/reservations-notification.service';
import { ReservationsRepeatedService } from './services/reservations-repeated.service';
import { ReservationsCoreService } from './services/reservations-core.service';
import { GrpcModule } from '../grpc/grpc.module';
import { ReservationsAdminService } from './services/reservations-admin.service';
import { ReservationCredentialsService } from './services/reservation-credentials.service';
import { ReservationLaboratoryEquipmentService } from './services/reservation-laboratory-equipment.service';

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
    ReservationsCoreService,
    ReservationProcessHistoryService,
    ReservationsValidationService,
    ReservationsAvailabilityService,
    ReservationsNotificationService,
    ReservationsRepeatedService,
    ReservationsAdminService,
    ReservationCredentialsService,
    ReservationLaboratoryEquipmentService,
  ],
  exports: [
    ReservationsService,
    ReservationProcessHistoryService,
    ReservationsNotificationService,
    ReservationLaboratoryEquipmentService,
  ],
})
export class ReservationsModule {}
