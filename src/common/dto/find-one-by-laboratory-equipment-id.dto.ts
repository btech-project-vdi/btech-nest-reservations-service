import { ParametersResponseDto } from './parameters-response.dto';

export class FindOneByLaboratoryEquipmentIdResponseDto {
  laboratoryId: string;
  description: string;
  serviceId: string;
  capacity: number;
  metadata: Record<string, any>;
  isActive: boolean;
  parameters: ParametersResponseDto;
}
