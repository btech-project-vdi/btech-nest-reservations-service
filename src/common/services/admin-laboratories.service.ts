import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { FindOneByLaboratoryEquipmentIdResponseDto } from '../dto/find-one-by-laboratory-equipment-id.dto';
import { FindLaboratoriesByServiceIdsResponseDto } from '../dto/find-laboratories-by-service-ids.dto';

@Injectable()
export class AdminLaboratoriesService {
  constructor(private readonly client: MessagingService) {}
  async findOneByLaboratoryEquipmentId(
    laboratoryEquipmentId: string,
  ): Promise<FindOneByLaboratoryEquipmentIdResponseDto> {
    return await this.client.send('findLaboratoryByLaboratoryEquipmentId', {
      laboratoryEquipmentId,
    });
  }

  async findLaboratoriesByServiceIds(
    serviceIds: string[],
  ): Promise<FindLaboratoriesByServiceIdsResponseDto[]> {
    return await this.client.send('findLaboratoriesByServiceIds', {
      serviceIds,
    });
  }
}
