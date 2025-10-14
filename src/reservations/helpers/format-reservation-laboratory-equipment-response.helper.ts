import { FindOneReservationLaboratoryEquipmentResponseDto } from '../dto/find-one-reservation-laboratory-equipment.dto';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';

export const formatReservationLaboratoryEquipmentResponse = (
  reservationLaboratoryEquipment: ReservationLaboratoryEquipment,
): FindOneReservationLaboratoryEquipmentResponseDto => {
  const startDate = new Date(reservationLaboratoryEquipment.reservationDate);
  const endDate = new Date(reservationLaboratoryEquipment.reservationFinalDate);

  const [startHours, startMinutes] = reservationLaboratoryEquipment.initialHour
    .split(':')
    .map(Number);
  const [endHours, endMinutes] = reservationLaboratoryEquipment.finalHour
    .split(':')
    .map(Number);
  startDate.setHours(startHours, startMinutes, 0, 0);
  endDate.setHours(endHours, endMinutes, 0, 0);
  const durationInMs = endDate.getTime() - startDate.getTime();
  const duration = Math.round(durationInMs / (1000 * 60));

  // Convertir las fechas a formato YYYY-MM-DD de forma segura
  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      // Si ya es string, asumimos que está en formato correcto
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  return {
    reservationLaboratoryEquipmentId:
      reservationLaboratoryEquipment.reservationLaboratoryEquipmentId,
    laboratoryEquipmentId: reservationLaboratoryEquipment.laboratoryEquipmentId,
    reservationDate: formatDate(reservationLaboratoryEquipment.reservationDate),
    reservationFinalDate: formatDate(
      reservationLaboratoryEquipment.reservationFinalDate,
    ),
    initialHour: reservationLaboratoryEquipment.initialHour,
    finalHour: reservationLaboratoryEquipment.finalHour,
    duration,
    metadata: reservationLaboratoryEquipment.metadata,
  };
};
