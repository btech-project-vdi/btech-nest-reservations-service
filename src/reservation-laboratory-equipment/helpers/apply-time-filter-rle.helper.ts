import { SelectQueryBuilder } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';

export function applyTimeFilterRle(
  queryBuilder: SelectQueryBuilder<ReservationLaboratoryEquipment>,
  startTime?: string,
  endTime?: string,
): void {
  if (startTime)
    queryBuilder.andWhere('rle.initialHour >= :startTime', { startTime });
  if (endTime) queryBuilder.andWhere('rle.finalHour <= :endTime', { endTime });
}
