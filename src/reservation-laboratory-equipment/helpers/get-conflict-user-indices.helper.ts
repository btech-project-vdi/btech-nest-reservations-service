import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { extractUserIndexFromMetadata } from './extract-user-index-from-metadata.helper';

export const getConflictingUserIndices = (
  overlappingReservations: ReservationLaboratoryEquipment[],
): number[] => {
  const conflictingIndices: number[] = [];

  for (const reservation of overlappingReservations) {
    if (reservation.metadata && reservation.metadata['username']) {
      // Extraer el índice del usuario del formato de usuario asignado
      const userIndex = extractUserIndexFromMetadata(reservation.metadata);
      if (userIndex !== -1) conflictingIndices.push(userIndex);
    }
  }

  return [...new Set(conflictingIndices)]; // Remover duplicados
};
