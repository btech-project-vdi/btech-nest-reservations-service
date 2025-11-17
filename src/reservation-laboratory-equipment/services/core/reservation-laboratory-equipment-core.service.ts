import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { ReservationLaboratoryEquipmentCreateService } from './reservation-laboratory-equipment-create.service';
import { ReservationLaboratoryEquipmentUpdateStatusService } from './reservation-laboratory-equipment-update-status.service';
import { ReservationLaboratoryEquipmentFindOneService } from './reservation-laboratory-equipment-find-one.service';
import { CreateReservationDetailDto } from 'src/reservation/dto/create-reservation-detail.dto';
import { InformationSubscriberDto } from 'src/reservation/dto/information-subscriber.dto';
import { UpdateReservationStatusDto } from 'src/reservation/dto/update-reservation-status.dto';
import { ResponseBaseMessageDto } from 'src/reservation/dto/response-base-message.dto';
import { FindOneReservationLaboratoryEquipmentResponseDto } from 'src/reservation/dto/find-one-reservation-laboratory-equipment.dto';

@Injectable()
export class ReservationLaboratoryEquipmentCoreService {
  constructor(
    private readonly reservationLaboratoryEquipmentCreateService: ReservationLaboratoryEquipmentCreateService,
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentUpdateStatusService))
    private readonly reservationLaboratoryEquipmentUpdateStatusService: ReservationLaboratoryEquipmentUpdateStatusService,
    private readonly reservationLaboratoryEquipmentFindOneService: ReservationLaboratoryEquipmentFindOneService,
  ) {}

  async create(
    createReservationDetailDto: CreateReservationDetailDto,
    informationSubscriber: InformationSubscriberDto,
    queryRunner?: QueryRunner,
    subscriptionDetailId?: string,
  ): Promise<ReservationLaboratoryEquipment> {
    return await this.reservationLaboratoryEquipmentCreateService.execute(
      createReservationDetailDto,
      informationSubscriber,
      queryRunner,
      subscriptionDetailId,
    );
  }

  async updateStatus(
    updateReservationStatusDto: UpdateReservationStatusDto,
  ): Promise<ResponseBaseMessageDto> {
    return await this.reservationLaboratoryEquipmentUpdateStatusService.execute(
      updateReservationStatusDto,
    );
  }

  async findOne(
    reservationLaboratoryEquipmentId: string,
  ): Promise<FindOneReservationLaboratoryEquipmentResponseDto> {
    return await this.reservationLaboratoryEquipmentFindOneService.execute(
      reservationLaboratoryEquipmentId,
    );
  }
}
