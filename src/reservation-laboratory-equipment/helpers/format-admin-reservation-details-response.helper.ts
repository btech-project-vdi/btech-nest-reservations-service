import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { FindAdminReservationDetailsResponseDto } from '../dto/find-admin-reservation-details.dto';

export const formatAdminReservationDetailsResponse = (
  reservationDetails: ReservationLaboratoryEquipment[],
  equipmentMap: Map<
    string,
    FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto
  >,
): FindAdminReservationDetailsResponseDto[] => {
  return reservationDetails.map((rle) => {
    const equipment = equipmentMap.get(rle.laboratoryEquipmentId);
    const startDate = new Date(rle.reservationDate);
    const endDate = new Date(rle.reservationFinalDate);

    const [startHours, startMinutes] = rle.initialHour.split(':').map(Number);
    const [endHours, endMinutes] = rle.finalHour.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);
    endDate.setHours(endHours, endMinutes, 0, 0);
    const durationInMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = Math.round(durationInMs / (1000 * 60));

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return {
      reservationId: rle.reservation.reservationId,
      subscriberId: rle.reservation.subscriberId,
      subscriptionDetailId: rle.reservation.subscriptionDetailId,
      username: rle.reservation.username,
      metadata: rle.reservation.metadata,
      createdAt: rle.reservation.createdAt.toISOString(),
      reservationDate: rle.reservationDate.toString(),
      reservationFinalDate: rle.reservationFinalDate
        ? rle.reservationFinalDate.toString()
        : null,
      reservationLaboratoryEquipmentId: rle.reservationLaboratoryEquipmentId,
      laboratoryEquipment: equipment
        ? {
            laboratoryEquipmentId: equipment.laboratoryEquipmentId,
            laboratoryId: equipment.laboratory.laboratoryId,
            laboratoryName: equipment.laboratory.description,
            equipmentName: equipment.equipment.description,
          }
        : null,
      initialHour: rle.initialHour,
      finalHour: rle.finalHour,
      duration,
      detailMetadata: rle.metadata,
      status: rle.status,
    };
  });
};
