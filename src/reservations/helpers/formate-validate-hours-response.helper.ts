import { AvailableSlotDto } from '../dto/get-available-slot.dto';
import { LaboratoryDisponibilityResponseDto } from '../dto/laboratories-disponibility-response.dto';

export const formatValidateHoursResponse = (
  slot: AvailableSlotDto,
): LaboratoryDisponibilityResponseDto[] => {
  return slot.laboratory.equipment.map((equipment) => ({
    laboratoryEquipmentId: slot.laboratoryEquipmentId,
    laboratoryId: slot.laboratoryId,
    description: slot.description,
    operationTime: [
      {
        start: slot.initialHour,
        end: slot.finalHour,
      },
    ],
    resources: equipment.resources.map((resource) => resource.resource),
  }));
};
