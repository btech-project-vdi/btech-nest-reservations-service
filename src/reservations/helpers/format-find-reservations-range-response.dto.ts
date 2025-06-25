import { FindReservationsByEquipmentAndDateRangeResponseDto } from '../dto/find-reservations-by-equipment-and-date-range.dto';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';

export const formatFindReservationsRangeResponse = (
  reservations: ReservationLaboratoryEquipment,
): FindReservationsByEquipmentAndDateRangeResponseDto => ({
  reservationLaboratoryEquipmentId:
    reservations.reservationLaboratoryEquipmentId,
  laboratoryEquipmentId: reservations.laboratoryEquipmentId,
  reservationDate: reservations.reservationDate,
  reservationFinalDate: reservations.reservationFinalDate,
  initialHour: reservations.initialHour,
  finalHour: reservations.finalHour,
  status: reservations.status,
});
