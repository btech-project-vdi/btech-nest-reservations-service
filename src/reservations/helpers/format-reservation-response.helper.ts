import { CreateReservationResponseDto } from '../dto/create-reservation.dto';
import { Reservation } from '../entities/reservation.entity';

export const formatReservationResponse = (
  reservation: Reservation,
): CreateReservationResponseDto => {
  return {
    reservationId: reservation.reservationId,
    createdAt: reservation.createdAt.toISOString(),
    subscriber: {
      subscriberId: reservation.subscriberId,
      username: reservation.username,
    },
    metadata: reservation.metadata,
    reservationLaboratoryEquipment:
      reservation.reservationLaboratoryEquipment.map((labEquipment) => ({
        reservationLaboratoryEquipmentId:
          labEquipment.reservationLaboratoryEquipmentId,
        laboratoryEquipmentId: labEquipment.laboratoryEquipmentId,
        reservationDate: labEquipment.reservationDate
          .toISOString()
          .split('T')[0],
        reservationFinalDate: labEquipment.reservationFinalDate
          .toISOString()
          .split('T')[0],
        initialHour: labEquipment.initialHour,
        finalHour: labEquipment.finalHour,
        metadata: labEquipment.metadata,
      })),
  };
};
