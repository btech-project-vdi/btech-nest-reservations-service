import { SelectQueryBuilder } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { TimePeriod } from '../enums/time-period.enum';
import { DateFilterType } from '../enums/date-filter-type.enum';
import { calculateTimePeriodDates } from '../helpers/calculate-time-period-dates.helper';

export function applyTimePeriodFilter(
  queryBuilder: SelectQueryBuilder<Reservation>,
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
