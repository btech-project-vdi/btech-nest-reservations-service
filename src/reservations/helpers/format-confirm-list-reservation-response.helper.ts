import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { LaboratoryEquipmentFindAllResponseDto } from '../dto/reservation-detail-find-all.dto';
import { ConfirmListReservationResponseDto } from 'src/systems/dto/confirm-list-reservation.dto';

export const formatConfirmListReservationResponse = (
  reservationLaboratoryEquipment: ReservationLaboratoryEquipment[],
  equipmentMap: Map<
    string,
    FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto
  >,
): ConfirmListReservationResponseDto[] => {
  return reservationLaboratoryEquipment.map((rle) => {
    const equipment = equipmentMap.get(rle.laboratoryEquipmentId);

    const reservationDetail: ConfirmListReservationResponseDto = {
      reservationLaboratoryEquipmentId: rle.reservationLaboratoryEquipmentId,
      subscriber: {
        subscriberId: rle.reservation.subscriberId,
        username: rle.reservation.username,
      },
      laboratoryEquipment: equipment
        ? {
            laboratoryEquipmentId: equipment.laboratoryEquipmentId,
            laboratoryId: equipment.laboratory.laboratoryId,
            laboratory: equipment.laboratory.description,
            equipmentId: equipment.equipment.equipmentId,
            equipment: equipment.equipment.description,
          }
        : ({} as LaboratoryEquipmentFindAllResponseDto),
      reservationDate: rle.reservationDate.toString(),
      reservationFinalDate: rle.reservationFinalDate.toString(),
      initialHour: rle.initialHour,
      finalHour: rle.finalHour,
      metadata: rle.metadata,
      createdAt: rle.createdAt?.toString() ?? new Date().toISOString(),
      status: rle.status ?? 'PENDING',
    };

    return reservationDetail;
  });
};
