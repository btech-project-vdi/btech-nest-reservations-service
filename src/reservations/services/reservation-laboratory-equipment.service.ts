import { Injectable } from '@nestjs/common';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { QueryRunner } from 'typeorm';
import {
  FindReservationsByEquipmentAndDateRangeDto,
  FindReservationsByEquipmentAndDateRangeResponseDto,
} from '../dto/find-reservations-by-equipment-and-date-range.dto';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { UpdateReservationStatusDto } from '../dto/update-reservation-status.dto';
import { ResponseBaseMessageDto } from '../dto/response-base-message.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfirmListReservationResponseDto } from 'src/systems/dto/confirm-list-reservation.dto';
import { Paginated } from 'src/common/dto/paginated.dto';
import { CompleteFinishedReservationsResponseDto } from '../dto/complete-finished-reservations.dto';
import { InformationSubscriberDto } from '../dto/information-subscriber.dto';
import { StatusReservation } from '../enums/status-reservation.enum';
import { ReservationLaboratoryEquipmentCoreService } from './reservation-laboratory-equipment-core.service';
import { ReservationLaboratoryEquipmentValidateService } from './reservation-laboratory-equipment-validate.service';
import { ReservationLaboratoryEquipmentCustomService } from './reservation-laboratory-equipment-custom.service';

@Injectable()
export class ReservationLaboratoryEquipmentService {
  constructor(
    private readonly coreService: ReservationLaboratoryEquipmentCoreService,
    private readonly validateService: ReservationLaboratoryEquipmentValidateService,
    private readonly customService: ReservationLaboratoryEquipmentCustomService,
  ) {}

  async create(
    createReservationDetailDto: CreateReservationDetailDto,
    informationSubscriber: InformationSubscriberDto,
    queryRunner?: QueryRunner,
  ): Promise<ReservationLaboratoryEquipment> {
    return this.coreService.create(
      createReservationDetailDto,
      informationSubscriber,
      queryRunner,
    );
  }

  async updateStatus(
    updateReservationStatusDto: UpdateReservationStatusDto,
  ): Promise<ResponseBaseMessageDto> {
    return this.coreService.updateStatus(updateReservationStatusDto);
  }

  async findReservationsByEquipmentAndDateRange(
    findReservationsByEquipmentAndDateRangeDto: FindReservationsByEquipmentAndDateRangeDto,
  ): Promise<FindReservationsByEquipmentAndDateRangeResponseDto[]> {
    return this.validateService.findReservationsByEquipmentAndDateRange(
      findReservationsByEquipmentAndDateRangeDto,
    );
  }

  async findReservationsByUserAndDateRange(
    userId: string,
    initialDate: Date,
    finalDate: Date,
  ): Promise<ReservationLaboratoryEquipment[]> {
    return this.validateService.findReservationsByUserAndDateRange(
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
    return this.validateService.checkAvailabilityBatch(
      labEquipmentIds,
      date,
      initialHour,
      finalHour,
    );
  }

  async confirmListReservation(
    paginationDto: PaginationDto,
    status: StatusReservation | undefined,
  ): Promise<Paginated<ConfirmListReservationResponseDto>> {
    return this.customService.confirmListReservation(paginationDto, status);
  }

  async findReservationsForReminder(): Promise<
    ReservationLaboratoryEquipment[]
  > {
    return this.customService.findReservationsForReminder();
  }

  async markReminderEmailSent(reservationId: string): Promise<void> {
    return this.coreService.markReminderEmailSent(reservationId);
  }

  async completeFinishedReservations(
    currentDateTime: Date,
  ): Promise<CompleteFinishedReservationsResponseDto> {
    return this.customService.completeFinishedReservations(currentDateTime);
  }

  async getLaboratoryEquipmentIdsWithReservations(): Promise<string[]> {
    return this.customService.getLaboratoryEquipmentIdsWithReservations();
  }
}
