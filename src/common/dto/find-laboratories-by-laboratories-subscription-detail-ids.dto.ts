import { EquipmentResponseDto } from './equipment-response.dto';
import { LaboratoryResponseDto } from './laboratory-response.dto';

export class FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto {
  laboratoryEquipmentId: string;
  description: string;
  quantity: number;
  laboratory: LaboratoryResponseDto;
  equipment: EquipmentResponseDto;
}
