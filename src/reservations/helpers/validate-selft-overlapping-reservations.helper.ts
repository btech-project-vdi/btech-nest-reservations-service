import { BadRequestException } from '@nestjs/common';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { getMinutesFromHours } from './get-minutes-from-hours.helper';

export const validateSelfOverlappingReservations = (
  details: CreateReservationDetailDto[],
): void => {
  if (details.length < 2) {
    return;
  }
  const sortedDetails = [...details].sort((a, b) => {
    const dateA = new Date(a.initialDate);
    const dateB = new Date(b.initialDate);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return (
      getMinutesFromHours(a.initialHour) - getMinutesFromHours(b.initialHour)
    );
  });

  for (let i = 0; i < sortedDetails.length; i++) {
    const detail1 = sortedDetails[i];
    const date1 = new Date(detail1.initialDate).toISOString().split('T')[0]; // Normalizar la fecha
    const initialMinutes1 = getMinutesFromHours(detail1.initialHour);
    const finalMinutes1 = getMinutesFromHours(detail1.finalHour);

    for (let j = i + 1; j < sortedDetails.length; j++) {
      const detail2 = sortedDetails[j];
      const date2 = new Date(detail2.initialDate).toISOString().split('T')[0]; // Normalizar la fecha

      // Si las fechas son diferentes, no hay superposición para esta pareja
      if (date1 !== date2) {
        continue;
      }

      const initialMinutes2 = getMinutesFromHours(detail2.initialHour);
      const finalMinutes2 = getMinutesFromHours(detail2.finalHour);
      const overlap =
        (initialMinutes1 < finalMinutes2 && finalMinutes1 > initialMinutes2) ||
        (initialMinutes2 < finalMinutes1 && finalMinutes2 > initialMinutes1);

      if (overlap) {
        throw new BadRequestException(
          `Superposición de horarios para el mismo usuario. Las reservas en la fecha ${date1} para las horas ${detail1.initialHour}-${detail1.finalHour} y ${detail2.initialHour}-${detail2.finalHour} se solapan. Un usuario no puede reservar dos laboratorios al mismo tiempo.`,
        );
      }
    }
  }
};
