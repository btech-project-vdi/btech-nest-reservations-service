import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Paginated } from 'src/common/dto/paginated.dto';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { ReservationLaboratoryEquipmentConfirmListService } from './reservation-laboratory-equipment-confirm-list.service';
import { ReservationLaboratoryEquipmentFindForReminderService } from './reservation-laboratory-equipment-find-for-reminder.service';
import { ReservationLaboratoryEquipmentCompleteFinishedService } from './reservation-laboratory-equipment-complete-finished.service';
import { ReservationLaboratoryEquipmentGetEquipmentIdsService } from './reservation-laboratory-equipment-get-equipment-ids.service';
import { ReservationLaboratoryEquipmentGetSubscriberMetadataService } from './reservation-laboratory-equipment-get-subscriber-metadata.service';
import { ReservationLaboratoryEquipmentGetSubscriberProfileService } from './reservation-laboratory-equipment-get-subscriber-profile.service';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';
import { CompleteFinishedReservationsResponseDto } from 'src/reservation/dto/complete-finished-reservations.dto';
import { ConfirmListReservationResponseDto } from 'src/reservation-process-history/dto/confirm-list-reservation.dto';

@Injectable()
export class ReservationLaboratoryEquipmentCustomService {
  constructor(
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentConfirmListService))
    private readonly reservationLaboratoryEquipmentConfirmListService: ReservationLaboratoryEquipmentConfirmListService,
    private readonly reservationLaboratoryEquipmentFindForReminderService: ReservationLaboratoryEquipmentFindForReminderService,
    private readonly reservationLaboratoryEquipmentCompleteFinishedService: ReservationLaboratoryEquipmentCompleteFinishedService,
    private readonly reservationLaboratoryEquipmentGetEquipmentIdsService: ReservationLaboratoryEquipmentGetEquipmentIdsService,
    private readonly reservationLaboratoryEquipmentGetSubscriberMetadataService: ReservationLaboratoryEquipmentGetSubscriberMetadataService,
    private readonly reservationLaboratoryEquipmentGetSubscriberProfileService: ReservationLaboratoryEquipmentGetSubscriberProfileService,
  ) {}

  async confirmListReservation(
    paginationDto: PaginationDto,
    status: StatusReservation | undefined,
  ): Promise<Paginated<ConfirmListReservationResponseDto>> {
    return await this.reservationLaboratoryEquipmentConfirmListService.execute(
      paginationDto,
      status,
    );
  }

  async findReservationsForReminder(): Promise<
    ReservationLaboratoryEquipment[]
  > {
    return await this.reservationLaboratoryEquipmentFindForReminderService.execute();
  }

  async completeFinishedReservations(
    currentDateTime: Date,
  ): Promise<CompleteFinishedReservationsResponseDto> {
    return await this.reservationLaboratoryEquipmentCompleteFinishedService.execute(
      currentDateTime,
    );
  }

  async getLaboratoryEquipmentIdsWithReservations(): Promise<string[]> {
    return await this.reservationLaboratoryEquipmentGetEquipmentIdsService.execute();
  }

  async getSubscriberMetadataForReservation(
    subscriberId: string,
    username: string,
  ): Promise<Record<string, any>> {
    return await this.reservationLaboratoryEquipmentGetSubscriberMetadataService.execute(
      subscriberId,
      username,
    );
  }

  async getSubscriberProfileForGrpcMetadata(
    subscriberId: string,
  ): Promise<Record<string, any> | undefined> {
    return await this.reservationLaboratoryEquipmentGetSubscriberProfileService.execute(
      subscriberId,
    );
  }
}
