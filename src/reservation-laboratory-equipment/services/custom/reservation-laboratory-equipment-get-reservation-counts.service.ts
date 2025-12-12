import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { ReservationCountByEquipmentDto } from '../../dto/reservation-count-by-equipment.dto';
import { TimePeriod } from 'src/reservation/enums/time-period.enum';
import { DateFilterType } from 'src/reservation/enums/date-filter-type.enum';
import { applyTimePeriodFilterRle } from '../../helpers/apply-time-period-filter-rle.helper';
import { applyTimeFilterRle } from '../../helpers/apply-time-filter-rle.helper';

@Injectable()
export class ReservationLaboratoryEquipmentGetReservationCountsService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(
    timePeriod?: TimePeriod,
    dateFilterType?: DateFilterType,
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<Map<string, number>> {
    const queryBuilder = this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .select('rle.laboratoryEquipmentId', 'laboratoryEquipmentId')
      .addSelect('COUNT(rle.reservationLaboratoryEquipmentId)', 'count')
      .groupBy('rle.laboratoryEquipmentId');
    // Aplicar filtros de fecha
    applyTimePeriodFilterRle(
      queryBuilder,
      timePeriod,
      startDate,
      endDate,
      dateFilterType,
    );
    if (startTime || endTime)
      applyTimeFilterRle(queryBuilder, startTime, endTime);
    const counts =
      await queryBuilder.getRawMany<ReservationCountByEquipmentDto>();
    const countMap = new Map<string, number>();
    counts.forEach((item) => {
      countMap.set(item.laboratoryEquipmentId, parseInt(String(item.count)));
    });
    return countMap;
  }
}
