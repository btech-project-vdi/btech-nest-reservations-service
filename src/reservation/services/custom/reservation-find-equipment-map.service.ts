import { Injectable } from '@nestjs/common';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';

@Injectable()
export class ReservationFindEquipmentMapService {
  constructor(
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
  ) {}

  async execute(
    laboratoryEquipmentIds: string[],
  ): Promise<
    Map<string, FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto>
  > {
    const equipmentDataPromises = laboratoryEquipmentIds.map((id) =>
      this.adminLaboratoriesService.findLaboratoryEquipmentByLaboratoryEquipmentId(
        id,
      ),
    );
    const equipmentData = await Promise.all(equipmentDataPromises);
    const equipmentMap = new Map(
      equipmentData.map((equipment) => [
        equipment.laboratoryEquipmentId,
        equipment,
      ]),
    );
    return equipmentMap;
  }
}
