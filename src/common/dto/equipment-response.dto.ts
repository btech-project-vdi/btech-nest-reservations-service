export class EquipmentResponseDto {
  equipmentId: string;
  description: string;
  equipmentResources: ResourcesResponseDto[];
}

export class ResourcesResponseDto {
  description: string;
  attribute: AttributesResponseDto;
}

export class AttributesResponseDto {
  description: string;
}
