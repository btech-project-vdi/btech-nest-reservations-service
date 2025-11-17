// src/admin-programming/programming/helpers/generate-potential-dates.ts
import { NamesDay } from '../enums/names-day.enum';
import { FindDaysWithDetailsDto } from 'src/common/dto/find-days-with-details.dto';
import { RepeatPattern } from '../enums/repeat-pattern.enum';

export const generatePotentialDates = (
  initialRepeatDate: Date, // Antes startDate
  finalRepeatDate: Date, // Antes endDate
  repeatPattern: RepeatPattern,
  daysOfWeek: NamesDay[],
  programmingDays: FindDaysWithDetailsDto[],
  slotInitialHour: string, // La hora de inicio del slot individual
  slotFinalHour: string, // La hora de fin del slot individual
  slotInitialDate: Date, // La fecha inicial del slot (ej: 2025-06-02)
  slotFinalDate: Date, // La fecha final del slot (ej: 2025-06-03)
): { reservationDate: Date; reservationFinalDate: Date }[] => {
  const dates: { reservationDate: Date; reservationFinalDate: Date }[] = [];
  const currentDate = new Date(initialRepeatDate);
  currentDate.setHours(0, 0, 0, 0);

  const finalRepeatDateCopy = new Date(finalRepeatDate);
  finalRepeatDateCopy.setHours(23, 59, 59, 999);

  const programmedDays = programmingDays.map((pd) =>
    pd.day.description.toLowerCase(),
  );

  // La lógica para determinar si un slot *individual* cruza la medianoche
  // se basa en las horas del slot, no en las fechas de repetición.
  const [startHourNum, startMinuteNum] = slotInitialHour.split(':').map(Number);
  const [endHourNum, endMinuteNum] = slotFinalHour.split(':').map(Number);
  const isOvernightSlot =
    startHourNum * 60 + startMinuteNum >= endHourNum * 60 + endMinuteNum;

  // Calcula la duración del slot en días para aplicarlo a cada fecha de repetición.
  // Esto es crucial para generar reservationFinalDate correctamente.
  const oneDay = 24 * 60 * 60 * 1000; // milisegundos en un día
  const daysDifference = Math.round(
    Math.abs(slotFinalDate.getTime() - slotInitialDate.getTime()) / oneDay,
  );

  while (currentDate <= finalRepeatDateCopy) {
    const currentDayName = currentDate
      .toLocaleDateString('es-ES', { weekday: 'long' })
      .toLowerCase();

    const isDayProgrammed = programmedDays.includes(currentDayName);

    if (isDayProgrammed) {
      let shouldInclude = false;

      if (repeatPattern === RepeatPattern.DAILY) {
        shouldInclude = true;
      } else if (repeatPattern === RepeatPattern.WEEKLY) {
        const formattedDayName =
          currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1);
        shouldInclude = daysOfWeek.some(
          (day) => day.toLowerCase() === formattedDayName.toLowerCase(),
        );
      }

      if (shouldInclude) {
        const reservationDate = new Date(currentDate);
        const reservationFinalDate = new Date(currentDate);

        // Si el slot individual cruza la medianoche, incrementa la fecha final por el número de días que dura el slot.
        if (isOvernightSlot || daysDifference > 0) {
          // Considera si el slot finaliza al día siguiente o más allá
          reservationFinalDate.setDate(
            reservationFinalDate.getDate() + daysDifference,
          );
        }

        dates.push({
          reservationDate: reservationDate,
          reservationFinalDate: reservationFinalDate,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
