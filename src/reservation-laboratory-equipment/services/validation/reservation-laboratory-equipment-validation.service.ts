import { Injectable } from '@nestjs/common';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { ReservationLaboratoryEquipmentFindByEquipmentRangeService } from './reservation-laboratory-equipment-find-by-equipment-range.service';
import { ReservationLaboratoryEquipmentFindByUserRangeService } from './reservation-laboratory-equipment-find-by-user-range.service';
import { ReservationLaboratoryEquipmentCheckAvailabilityBatchService } from './reservation-laboratory-equipment-check-availability-batch.service';
import {
  FindReservationsByEquipmentAndDateRangeDto,
  FindReservationsByEquipmentAndDateRangeResponseDto,
} from 'src/reservation/dto/find-reservations-by-equipment-and-date-range.dto';

@Injectable()
export class ReservationLaboratoryEquipmentValidationService {
  constructor(
    private readonly reservationLaboratoryEquipmentFindByEquipmentRangeService: ReservationLaboratoryEquipmentFindByEquipmentRangeService,
    private readonly reservationLaboratoryEquipmentFindByUserRangeService: ReservationLaboratoryEquipmentFindByUserRangeService,
    private readonly reservationLaboratoryEquipmentCheckAvailabilityBatchService: ReservationLaboratoryEquipmentCheckAvailabilityBatchService,
  ) {}

  async findReservationsByEquipmentAndDateRange(
    findReservationsByEquipmentAndDateRangeDto: FindReservationsByEquipmentAndDateRangeDto,
  ): Promise<FindReservationsByEquipmentAndDateRangeResponseDto[]> {
    return await this.reservationLaboratoryEquipmentFindByEquipmentRangeService.execute(
      findReservationsByEquipmentAndDateRangeDto,
    );
  }

  async findReservationsByUserAndDateRange(
    userId: string,
    initialDate: Date,
    finalDate: Date,
  ): Promise<ReservationLaboratoryEquipment[]> {
    return await this.reservationLaboratoryEquipmentFindByUserRangeService.execute(
      userId,
      initialDate,
      finalDate,
    );
  }

  async checkAvailabilityBatch(
    labEquipmentIds: string[],
    date: string,
    initialHour: string,
    finalHour: string,
  ): Promise<Map<string, number>> {
    return await this.reservationLaboratoryEquipmentCheckAvailabilityBatchService.execute(
      labEquipmentIds,
      date,
      initialHour,
      finalHour,
    );
  }
}
