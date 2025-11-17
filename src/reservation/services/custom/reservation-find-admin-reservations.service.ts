import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Paginated } from 'src/common/dto/paginated.dto';
import { paginateQueryBuilder } from 'src/common/helpers/paginate-query-builder.helper';
import { applyTimePeriodFilter } from '../../helpers/apply-time-period-filter.helper';
import { applyTimeFilter } from '../../helpers/apply-time-filter.helper';
import {
  FindAdminReservationsDto,
  FindAdminReservationsResponseDto,
} from 'src/reservation/dto/find-admin-reservations.dto';
import { formatFindReservationsResponse } from 'src/reservation/helpers/format-find-reservations-response.helper';
import { ReservationFindEquipmentMapService } from './reservation-find-equipment-map.service';

@Injectable()
export class ReservationFindAdminReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly reservationFindEquipmentMapService: ReservationFindEquipmentMapService,
  ) {}

  async execute(
    findAdminReservationsDto: FindAdminReservationsDto,
  ): Promise<Paginated<FindAdminReservationsResponseDto>> {
    const {
      laboratoryEquipmentId,
      subscriberId,
      subscriptionDetailId,
      reservationId,
      timePeriod,
      dateFilterType,
      startDate,
      endDate,
      startTime,
      endTime,
      itemPage,
      itemLimit,
      ...paginationDto
    } = findAdminReservationsDto;
    const queryBuilder = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.reservationLaboratoryEquipment', 'rle')
      .select([
        'reservation.reservationId',
        'reservation.subscriberId',
        'reservation.subscriptionDetailId',
        'reservation.username',
        'reservation.metadata',
        'reservation.createdAt',
        'rle.reservationLaboratoryEquipmentId',
        'rle.laboratoryEquipmentId',
        'rle.subscriptionDetailId',
        'rle.reservationDate',
        'rle.reservationFinalDate',
        'rle.initialHour',
        'rle.finalHour',
        'rle.metadata',
        'rle.status',
      ])
      .orderBy('reservation.createdAt', 'DESC');

    if (laboratoryEquipmentId)
      queryBuilder.andWhere(
        'rle.laboratoryEquipmentId = :laboratoryEquipmentId',
        {
          laboratoryEquipmentId,
        },
      );
    if (subscriberId)
      queryBuilder.andWhere('reservation.subscriberId = :subscriberId', {
        subscriberId,
      });
    if (subscriptionDetailId)
      queryBuilder.andWhere(
        'reservation.subscriptionDetailId = :subscriptionDetailId',
        {
          subscriptionDetailId,
        },
      );
    if (reservationId)
      queryBuilder.andWhere('reservation.reservationId = :reservationId', {
        reservationId,
      });
    applyTimePeriodFilter(
      queryBuilder,
      timePeriod,
      startDate,
      endDate,
      dateFilterType,
    );
    if (startTime || endTime) applyTimeFilter(queryBuilder, startTime, endTime);
    const paginatedReservations = await paginateQueryBuilder(
      queryBuilder,
      paginationDto,
    );
    const laboratoryEquipmentIds = [
      ...new Set(
        paginatedReservations.data
          .flatMap((r) => r.reservationLaboratoryEquipment)
          .map((rle) => rle.laboratoryEquipmentId)
          .filter(Boolean),
      ),
    ];
    const equipmentMap = await this.reservationFindEquipmentMapService.execute(
      laboratoryEquipmentIds,
    );
    const reservationsResponseFormat = formatFindReservationsResponse(
      paginatedReservations.data,
      equipmentMap,
      { itemPage, itemLimit },
    );

    return {
      data: reservationsResponseFormat,
      total: paginatedReservations.total,
      page: paginatedReservations.page,
      limit: paginatedReservations.limit,
      totalPages: paginatedReservations.totalPages,
    };
  }
}
