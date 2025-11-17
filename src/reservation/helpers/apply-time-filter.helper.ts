import { SelectQueryBuilder } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';

export function applyTimeFilter(
  queryBuilder: SelectQueryBuilder<Reservation>,
  startTime?: string,
  endTime?: string,
): void {
  if (startTime)
    queryBuilder.andWhere('rle.initialHour >= :startTime', { startTime });
  if (endTime) queryBuilder.andWhere('rle.finalHour <= :endTime', { endTime });
}
