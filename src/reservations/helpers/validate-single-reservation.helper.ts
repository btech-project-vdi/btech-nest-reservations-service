// src/admin-programming/programming/helpers/validate-single-reservation.ts
import { FindDaysWithDetailsDto } from 'src/common/dto/find-days-with-details.dto';
import { FindReservationsByEquipmentAndDateRangeResponseDto } from '../dto/find-reservations-by-equipment-and-date-range.dto';

export const validateSingleReservation = (
  reservationDate: Date, // Fecha de inicio del "día lógico" de la reserva (ej: Lunes 2025-06-02)
  reservationFinalDate: Date, // Fecha de fin del "día lógico" de la reserva (ej: Martes 2025-06-03)
  initialHour: string,
  finalHour: string,
  labEquipmentId: string,
  maxCapacity: number,
  existingReservations: FindReservationsByEquipmentAndDateRangeResponseDto[],
  programmingDays: FindDaysWithDetailsDto[],
): { isValid: boolean; reason?: string } => {
  const dayNameInitial = reservationDate
    .toLocaleDateString('es-ES', { weekday: 'long' })
    .toLowerCase();
  const dayNameFinal = reservationFinalDate
    .toLocaleDateString('es-ES', { weekday: 'long' })
    .toLowerCase();

  const programmingDayForInitialDay = programmingDays.find(
    (pd) => pd.day.description.toLowerCase() === dayNameInitial,
  );

  // Si la reserva cruza la medianoche, también necesitamos la programación del día siguiente.
  let programmingDayForFinalDay: FindDaysWithDetailsDto | undefined;
  const [startHourNum, startMinuteNum] = initialHour.split(':').map(Number); // <--- Aquí la modificación
  const [endHourNum, endMinuteNum] = finalHour.split(':').map(Number); // <--- Aquí la modificación

  const isOvernightReservation =
    startHourNum * 60 + startMinuteNum >= endHourNum * 60 + endMinuteNum;

  if (isOvernightReservation) {
    programmingDayForFinalDay = programmingDays.find(
      (pd) => pd.day.description.toLowerCase() === dayNameFinal,
    );
  }

  if (!programmingDayForInitialDay) {
    return { isValid: false, reason: 'Día de inicio no programado' };
  }
  // Si es una reserva nocturna y el día final no está programado, no es válida.
  if (isOvernightReservation && !programmingDayForFinalDay) {
    return {
      isValid: false,
      reason: 'Día de finalización no programado para reservas nocturnas',
    };
  }

  // Convertir horas de la reserva solicitada a minutos para validación
  const [initialHourPart, initialMinutePart] = initialHour
    .split(':')
    .map(Number);
  const [finalHourPart, finalMinutePart] = finalHour.split(':').map(Number);

  const requestedStartMinutes = initialHourPart * 60 + initialMinutePart;
  let requestedEndMinutes = finalHourPart * 60 + finalMinutePart;

  if (isOvernightReservation) {
    requestedEndMinutes += 24 * 60; // Ajustar para que las 02:00 del día siguiente sea 26*60
  }

  // Consolidar todos los rangos programados relevantes
  // Si es una reserva nocturna, necesitamos unir los horarios del día de inicio y del día de fin
  const allProgrammedRanges: { start: number; end: number }[] = [];

  // Añadir rangos del día de inicio
  for (const hr of programmingDayForInitialDay.hours) {
    const [progStartH, progStartM] = hr.initialHour.split(':').map(Number);
    const [progEndH, progEndM] = hr.finalHour.split(':').map(Number);
    const progStart = progStartH * 60 + progStartM;
    let progEnd = progEndH * 60 + progEndM;
    // Si la programación misma cruza la medianoche (ej: Lunes 23:00 - Martes 01:00)
    if (progStart >= progEnd) {
      progEnd += 24 * 60;
    }
    allProgrammedRanges.push({ start: progStart, end: progEnd });
  }

  // Si es una reserva nocturna, añadir los rangos del día de finalización,
  // ajustando sus horas para estar "después" de la medianoche del día inicial.
  if (isOvernightReservation && programmingDayForFinalDay) {
    for (const hr of programmingDayForFinalDay.hours) {
      const [progStartH, progStartM] = hr.initialHour.split(':').map(Number);
      const [progEndH, progEndM] = hr.finalHour.split(':').map(Number);
      const progStart = progStartH * 60 + progStartM;
      const progEnd = progEndH * 60 + progEndM;
      // Estos horarios del día final deben considerarse como si estuvieran en el día siguiente
      // al `reservationDate`. Por eso, sumamos 24 horas a sus minutos.
      allProgrammedRanges.push({
        start: progStart + 24 * 60,
        end: progEnd + 24 * 60,
      });
    }
  }

  // Verificar que el rango solicitado esté completamente dentro de AL MENOS UN rango programado consolidado
  // O, si se extiende a través de múltiples rangos, que cada segmento esté cubierto.
  // La lógica de "dentro del horario programado" para rangos que cruzan la medianoche es más compleja.
  // En lugar de verificar si está "completamente dentro de UN rango",
  // verificaremos que CADA SEGMENTO de 30 minutos de la reserva solicitada
  // esté cubierto por AL MENOS UN rango programado.

  let isWithinProgrammedHours = true;
  for (
    let segmentMinutes = requestedStartMinutes;
    segmentMinutes < requestedEndMinutes;
    segmentMinutes += 30
  ) {
    let segmentCovered = false;
    for (const programRange of allProgrammedRanges) {
      if (
        segmentMinutes >= programRange.start &&
        segmentMinutes < programRange.end
      ) {
        segmentCovered = true;
        break;
      }
    }
    if (!segmentCovered) {
      isWithinProgrammedHours = false;
      // Para un mensaje más detallado:
      const segmentHour = Math.floor(segmentMinutes / 60) % 24;
      const segmentMinute = segmentMinutes % 60;
      const segmentTime = `${String(segmentHour).padStart(2, '0')}:${String(segmentMinute).padStart(2, '0')}`;
      return {
        isValid: false,
        reason: `Parte de la reserva (${segmentTime}) está fuera del horario programado`,
      };
    }
  }

  if (!isWithinProgrammedHours) {
    // Esto debería ser inalcanzable con la lógica de arriba, pero lo dejo por seguridad.
    return { isValid: false, reason: 'Fuera del horario programado general' };
  }

  // --- El resto de la lógica de validación de disponibilidad ---

  // Verificar disponibilidad en intervalos de 30 minutos
  for (
    let segment = requestedStartMinutes;
    segment < requestedEndMinutes;
    segment += 30
  ) {
    const segmentHour = Math.floor(segment / 60) % 24;
    const segmentMinute = segment % 60;

    const segmentDateTime = new Date(reservationDate); // Empezamos con la fecha de inicio de la reserva
    // Ajustar la fecha del segmento si es necesario (si la reserva cruza la medianoche y el segmento está en el día siguiente)
    if (segment >= 24 * 60) {
      // Si los minutos del segmento exceden 24 horas
      segmentDateTime.setDate(segmentDateTime.getDate() + 1);
    }
    segmentDateTime.setHours(segmentHour, segmentMinute, 0, 0);

    const segmentDateKey = segmentDateTime.toISOString().split('T')[0];
    const segmentTimeKey = `${String(segmentHour).padStart(2, '0')}:${String(
      segmentMinute,
    ).padStart(2, '0')}`;

    // Contar reservas existentes para este segmento
    const reservationsForSegment = existingReservations.filter((res) => {
      // 1. Primero verifica que las fechas se solapen a nivel de días completos
      const resInitialDate = new Date(res.reservationDate);
      const resFinalDate = res.reservationFinalDate
        ? new Date(res.reservationFinalDate)
        : new Date(res.reservationDate);

      // Ajustar fechas para comparación (ignorar horas)
      resInitialDate.setHours(0, 0, 0, 0);
      resFinalDate.setHours(0, 0, 0, 0);
      const currentResInitialDate = new Date(reservationDate);
      currentResInitialDate.setHours(0, 0, 0, 0);
      const currentResFinalDate = new Date(reservationFinalDate);
      currentResFinalDate.setHours(0, 0, 0, 0);

      // Si no hay solapamiento a nivel de fechas, descartar
      if (
        resFinalDate < currentResInitialDate ||
        resInitialDate > currentResFinalDate
      ) {
        return false;
      }

      // 2. Ahora verificar solapamiento de horas exactas
      const [resInitialHour, resInitialMinute] = res.initialHour
        .split(':')
        .map(Number);
      const [resFinalHour, resFinalMinute] = res.finalHour
        .split(':')
        .map(Number);

      // Convertir a minutos desde medianoche
      const resStart = resInitialHour * 60 + resInitialMinute;
      const resEnd = resFinalHour * 60 + resFinalMinute;
      const reqStart = requestedStartMinutes;
      const reqEnd = requestedEndMinutes;

      // Determinar si la reserva existente cruza la medianoche
      const isResOvernight = resStart >= resEnd;

      // Determinar rangos de comparación
      const resRange = isResOvernight
        ? { start: resStart, end: resEnd + 24 * 60 }
        : { start: resStart, end: resEnd };

      const reqRange = isOvernightReservation
        ? { start: reqStart, end: reqEnd + 24 * 60 }
        : { start: reqStart, end: reqEnd };

      // Verificar solapamiento de rangos
      return !(
        resRange.end <= reqRange.start || resRange.start >= reqRange.end
      );
    }).length;

    if (reservationsForSegment >= maxCapacity) {
      return {
        isValid: false,
        reason: `No hay disponibilidad a las ${segmentTimeKey} del día ${segmentDateKey}`,
      };
    }
  }

  return { isValid: true };
};
