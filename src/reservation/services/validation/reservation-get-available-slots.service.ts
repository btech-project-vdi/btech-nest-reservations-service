import { Injectable } from '@nestjs/common';
import { FindAvailableProgrammingHoursResponseDto } from 'src/common/dto/find-available-programming-hours.dto';
import { FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto } from 'src/common/dto/find-laboratories-by-laboratories-subscription-detail-ids.dto';
import { ReservationLaboratoryEquipmentValidationService } from 'src/reservation-laboratory-equipment/services/validation/reservation-laboratory-equipment-validation.service';

@Injectable()
export class ReservationGetAvailableSlotsService {
  constructor(
    private readonly reservationLaboratoryEquipmentValidationService: ReservationLaboratoryEquipmentValidationService,
  ) {}

  async execute(
    availableProgrammingHours: FindAvailableProgrammingHoursResponseDto[],
    laboratoriesInfo: FindLaboratoriesByLaboratoriesSubscriptionDetailIdsResponseDto[],
    queryDateFormatted: string,
    initialHourString: string,
    finalHourString: string,
  ) {
    // Optimización: Pre-cargar disponibilidad de todos los equipos de una vez
    const laboratoryEquipmentIds = laboratoriesInfo
      .map((le) => le.laboratoryEquipmentId)
      .filter(Boolean);

    const availabilityMap =
      await this.reservationLaboratoryEquipmentValidationService.checkAvailabilityBatch(
        laboratoryEquipmentIds,
        queryDateFormatted,
        initialHourString,
        finalHourString,
      );

    return await Promise.all(
      availableProgrammingHours.map((slot) => {
        const equipmentWithAvailability = laboratoriesInfo.map((le) => {
          if (!le.laboratoryEquipmentId) {
            return {
              ...le,
              availableQuantity: 0,
              isAvailable: false,
            };
          }

          // Usar disponibilidad pre-cargada en lugar de consulta individual
          const overlappingReservationsCount =
            availabilityMap.get(le.laboratoryEquipmentId) || 0;
          const availableQuantity = le.quantity - overlappingReservationsCount;

          return {
            equipmentId: le.equipment.equipmentId,
            description: le.equipment.description,
            quantity: le.quantity,
            availableQuantity,
            isAvailable: availableQuantity > 0,
            resources: le.equipment.equipmentResources.map((er) => ({
              attribute: er.attribute.description,
              resource: er.description,
            })),
          };
        });

        const firstLab = laboratoriesInfo[0];
        return {
          laboratoryId: firstLab.laboratory.laboratoryId,
          laboratoryEquipmentId: firstLab.laboratoryEquipmentId,
          description: firstLab.laboratory.description,
          slotId: slot.programmingHoursId,
          initialHour: slot.initialHour,
          finalHour: slot.finalHour,
          laboratory: {
            laboratoryId: firstLab.laboratory.laboratoryId,
            description: firstLab.laboratory.description,
            equipment: equipmentWithAvailability.filter((e) => e.isAvailable),
          },
        };
      }),
    );
  }
}
