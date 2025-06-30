import { BadRequestException } from '@nestjs/common';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';

export const validateUniqueEquipmentPerDayInRequest = (
  details: CreateReservationDetailDto[],
): void => {
  // Usaremos un Set para almacenar combinaciones únicas de equipo y fecha
  // Formato de clave: "laboratoryEquipeId_fechaNormalizada"
  const uniqueEquipmentDayCombinations = new Set<string>();

  for (const detail of details) {
    const normalizedDate = new Date(detail.initialDate)
      .toISOString()
      .split('T')[0];
    const key = `${detail.laboratoryEquipmentId}_${normalizedDate}`;

    if (uniqueEquipmentDayCombinations.has(key)) {
      throw new BadRequestException(
        `El equipo con ID '${detail.laboratoryEquipmentId}' ya ha sido reservado para la fecha '${normalizedDate}' en esta misma solicitud. Un equipo no puede reservarse más de una vez por día en la misma petición.`,
      );
    }
    uniqueEquipmentDayCombinations.add(key);
  }
};
