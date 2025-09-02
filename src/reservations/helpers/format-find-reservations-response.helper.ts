import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { FindAllReservationsResponseDto } from '../dto/find-all-reservations.dto';
import { Reservation } from '../entities/reservation.entity';
import {
  LaboratoryEquipmentFindAllResponseDto,
  ReservationDetailFindAllResponseDto,
} from '../dto/reservation-detail-find-all.dto';

export const formatFindReservationsResponse = (
  reservations: Reservation[],
  equipmentMap: Map<
    string,
    FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto
  >,
  itemPagination?: { itemPage?: number; itemLimit?: number },
): FindAllReservationsResponseDto[] => {
  const { itemPage = 1, itemLimit = 10 } = itemPagination || {};

  return reservations.map((reservation) => {
    const sortedItems = reservation.reservationLaboratoryEquipment.sort(
      (a, b) => {
        // Ordenar por fecha y luego por hora inicial
        const dateA = new Date(a.reservationDate).getTime();
        const dateB = new Date(b.reservationDate).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return b.initialHour.localeCompare(a.initialHour);
      },
    );

    // Aplicar paginación a los items
    const startIndex = (itemPage - 1) * itemLimit;
    const endIndex = startIndex + itemLimit;
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    return {
      reservationId: reservation.reservationId,
      subscriberId: reservation.subscriberId,
      username: reservation.username,
      metadata: reservation.metadata,
      createdAt: reservation.createdAt.toISOString(),
      reservationLaboratoryEquipment: paginatedItems.map((rle) => {
        const equipment = equipmentMap.get(rle.laboratoryEquipmentId);
        const startDate = new Date(rle.reservationDate);
        const endDate = new Date(rle.reservationFinalDate);

        const [startHours, startMinutes] = rle.initialHour
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = rle.finalHour.split(':').map(Number);
        startDate.setHours(startHours, startMinutes, 0, 0);
        endDate.setHours(endHours, endMinutes, 0, 0);
        const durationInMs = endDate.getTime() - startDate.getTime();
        const duration = Math.round(durationInMs / (1000 * 60));

        const reservationDetail: ReservationDetailFindAllResponseDto = {
          reservationLaboratoryEquipmentId:
            rle.reservationLaboratoryEquipmentId,
          laboratoryEquipment: equipment
            ? ({
                laboratoryEquipmentId: equipment.laboratoryEquipmentId,
                laboratoryId: equipment.laboratory.laboratoryId,
                laboratory: equipment.laboratory.description,
                equipmentId: equipment.equipment.equipmentId,
                equipment: equipment.equipment.description,
              } as LaboratoryEquipmentFindAllResponseDto)
            : ({} as LaboratoryEquipmentFindAllResponseDto),
          reservationDate: rle.reservationDate.toString(),
          reservationFinalDate: rle.reservationFinalDate.toString(),
          initialHour: rle.initialHour,
          finalHour: rle.finalHour,
          duration,
          metadata: rle.metadata,
          status: rle.status,
        };

        return reservationDetail;
      }),
      // Información de paginación de items para esta reserva
      total: sortedItems.length,
      page: itemPage,
      limit: itemLimit,
      totalPages: Math.ceil(sortedItems.length / itemLimit),
    };
  });
};
