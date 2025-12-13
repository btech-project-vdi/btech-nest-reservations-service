import { Injectable } from '@nestjs/common';
import { FindOneByLaboratoryEquipmentIdResponseDto } from '../dto/find-one-by-laboratory-equipment-id.dto';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from '../dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto } from '../dto/find-laboratories-by-laboratories-subscription-detail-ids.dto';
import {
  FindLaboratoriesWithReservationsFiltersDto,
  LaboratoryWithReservationsFilterResponseDto,
} from '../dto/find-laboratories-with-reservations-filters.dto';
import { NatsService } from 'src/communications/nats';
import { PaginationResponseDto } from '../dto/pagination.dto';

@Injectable()
export class AdminLaboratoriesService {
  constructor(private readonly client: NatsService) {}
  async findOneByLaboratoryEquipmentId(
    laboratoryEquipmentId: string,
  ): Promise<FindOneByLaboratoryEquipmentIdResponseDto> {
    return await this.client.send(
      'laboratoriesSubscriptionDetail.findOneByLaboratoryEquipmentId',
      {
        laboratoryEquipmentId,
      },
    );
  }

  async findLaboratoriesSubscriptionDetailsIdsBySubscriptionDetailId(
    subscriptionDetailId: string,
  ): Promise<string[]> {
    return await this.client.send(
      'laboratoriesSubscriptionDetail.findIdsBySubscriptionDetailId',
      { subscriptionDetailId },
    );
  }

  async findByLaboratoriesSubscriptionDetailsIds(
    laboratoriesSubscriptionDetailsIds: string[],
  ): Promise<FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto[]> {
    return await this.client.send(
      'laboratoryEquipment.findByLaboratoriesSubscriptionDetailsIds',
      {
        laboratoriesSubscriptionDetailsIds,
      },
    );
  }

  async findLaboratoryEquipmentByLaboratoryEquipmentId(
    laboratoryEquipmentId: string,
  ): Promise<FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto> {
    return await this.client.send(
      'laboratoryEquipment.findByLaboratoryEquipmentId',
      { laboratoryEquipmentId },
    );
  }

  async findReminderMinutesByLaboratoryEquipmentId(
    laboratoryEquipmentId: string,
  ): Promise<{ reminderMinutesBefore: number }> {
    return await this.client.send(
      'laboratoriesSubscriptionDetail.findReminderMinutesByLaboratoryEquipmentId',
      { laboratoryEquipmentId },
    );
  }

  async findLaboratoriesWithReservationsFilters(
    findLaboratoriesWithReservationsFiltersDto: FindLaboratoriesWithReservationsFiltersDto,
  ): Promise<
    PaginationResponseDto<LaboratoryWithReservationsFilterResponseDto>
  > {
    return await this.client.send(
      'laboratoryEquipment.findLaboratoriesWithReservationsFilters',
      findLaboratoriesWithReservationsFiltersDto,
    );
  }
}
