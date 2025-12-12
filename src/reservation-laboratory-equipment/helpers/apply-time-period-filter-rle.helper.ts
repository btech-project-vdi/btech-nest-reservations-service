import { SelectQueryBuilder } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { TimePeriod } from 'src/reservation/enums/time-period.enum';
import { DateFilterType } from 'src/reservation/enums/date-filter-type.enum';
import { calculateTimePeriodDates } from 'src/reservation/helpers/calculate-time-period-dates.helper';

export function applyTimePeriodFilterRle(
  queryBuilder: SelectQueryBuilder<ReservationLaboratoryEquipment>,
  timePeriod?: TimePeriod,
  startDate?: string,
  endDate?: string,
  dateFilterType?: DateFilterType,
): void {
  if (!timePeriod) return;

  const { fromDate, toDate } = calculateTimePeriodDates(
    timePeriod,
    startDate,
    endDate,
  );

  if (fromDate && toDate) {
    const filterType = dateFilterType || DateFilterType.RESERVATION_START_DATE;
    if (filterType === DateFilterType.CREATION_DATE)
      // Filtrar por fecha de creación de la reserva
      queryBuilder.andWhere(
        'DATE(reservation.createdAt) BETWEEN :fromDate AND :toDate',
        {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        },
      );
    else
      // Filtrar por fecha de inicio del item (comportamiento por defecto)
      queryBuilder.andWhere(
        'rle.reservationDate BETWEEN :fromDate AND :toDate',
        {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        },
      );
  }
}
