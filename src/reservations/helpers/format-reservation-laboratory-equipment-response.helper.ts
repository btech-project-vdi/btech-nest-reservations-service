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
  return {
    reservationLaboratoryEquipmentId:
      reservationLaboratoryEquipment.reservationLaboratoryEquipmentId,
    laboratoryEquipmentId: reservationLaboratoryEquipment.laboratoryEquipmentId,
    reservationDate: reservationLaboratoryEquipment.reservationDate
      .toISOString()
      .split('T')[0],
    reservationFinalDate: reservationLaboratoryEquipment.reservationFinalDate
      .toISOString()
      .split('T')[0],
    initialHour: reservationLaboratoryEquipment.initialHour,
    finalHour: reservationLaboratoryEquipment.finalHour,
    duration,
    metadata: reservationLaboratoryEquipment.metadata,
  };
};
