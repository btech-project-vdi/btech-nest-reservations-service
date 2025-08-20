import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { FindOneByLaboratoryEquipmentIdResponseDto } from '../dto/find-one-by-laboratory-equipment-id.dto';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from '../dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto } from '../dto/find-laboratories-by-laboratories-subscription-detail-ids.dto';

@Injectable()
export class AdminLaboratoriesService {
  constructor(private readonly client: MessagingService) {}
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
      'laboratories.findByLaboratoriesSubscriptionDetailsIds',
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
}
