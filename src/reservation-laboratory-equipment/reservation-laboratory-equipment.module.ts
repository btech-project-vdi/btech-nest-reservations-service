import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationLaboratoryEquipment } from './entities/reservation-laboratory-equipment.entity';
import { CommonModule } from 'src/common/common.module';
import { GrpcModule } from 'src/communications/grpc/grpc.module';
import { RESERVATION_LABORATORY_EQUIPMENT_CORE_SERVICES } from './services/core';
import { RESERVATION_LABORATORY_EQUIPMENT_CUSTOM_SERVICES } from './services/custom';
import { RESERVATION_LABORATORY_EQUIPMENT_VALIDATION_SERVICES } from './services/validation';
import { RESERVATION_LABORATORY_EQUIPMENT_CONTROLLERS } from './controllers';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationLaboratoryEquipment]),
    forwardRef(() => ReservationModule),
    CommonModule,
    GrpcModule,
  ],
  controllers: [...RESERVATION_LABORATORY_EQUIPMENT_CONTROLLERS],
  providers: [
    ...RESERVATION_LABORATORY_EQUIPMENT_CORE_SERVICES,
    ...RESERVATION_LABORATORY_EQUIPMENT_CUSTOM_SERVICES,
    ...RESERVATION_LABORATORY_EQUIPMENT_VALIDATION_SERVICES,
  ],
  exports: [
    ...RESERVATION_LABORATORY_EQUIPMENT_CORE_SERVICES,
    ...RESERVATION_LABORATORY_EQUIPMENT_CUSTOM_SERVICES,
    ...RESERVATION_LABORATORY_EQUIPMENT_VALIDATION_SERVICES,
  ],
})
export class ReservationLaboratoryEquipmentModule {}
