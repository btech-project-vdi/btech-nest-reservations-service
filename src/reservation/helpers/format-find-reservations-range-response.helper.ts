import { ReservationLaboratoryEquipment } from 'src/reservation-laboratory-equipment/entities/reservation-laboratory-equipment.entity';
import { FindReservationsByEquipmentAndDateRangeResponseDto } from '../dto/find-reservations-by-equipment-and-date-range.dto';

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
