import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { paginateQueryBuilder } from 'src/common/helpers/paginate-query-builder.helper';
import { applyTimePeriodFilterRle } from '../../helpers/apply-time-period-filter-rle.helper';
import { applyTimeFilterRle } from '../../helpers/apply-time-filter-rle.helper';
import {
  FindAdminReservationDetailsDto,
  FindAdminReservationDetailsResponseDto,
} from '../../dto/find-admin-reservation-details.dto';
import { ReservationFindEquipmentMapService } from 'src/reservation/services/custom/reservation-find-equipment-map.service';
import { formatAdminReservationDetailsResponse } from '../../helpers/format-admin-reservation-details-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReservationLaboratoryEquipmentFindAdminDetailsService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    private readonly reservationFindEquipmentMapService: ReservationFindEquipmentMapService,
  ) {}

  async execute(
    findAdminReservationDetailsDto: FindAdminReservationDetailsDto,
  ): Promise<PaginationResponseDto<FindAdminReservationDetailsResponseDto>> {
    const {
      laboratoryEquipmentIds,
      subscriberIds,
      subscriptionDetailId,
      reservationId,
      timePeriod,
      dateFilterType,
      startDate,
      endDate,
      startTime,
      endTime,
      ...paginationDto
    } = findAdminReservationDetailsDto;

    const queryBuilder = this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .leftJoinAndSelect('rle.reservation', 'reservation')
      .select([
        'rle.reservationLaboratoryEquipmentId',
        'rle.laboratoryEquipmentId',
        'rle.subscriptionDetailId',
        'rle.reservationDate',
        'rle.reservationFinalDate',
        'rle.initialHour',
        'rle.finalHour',
        'rle.metadata',
        'rle.status',
        'rle.createdAt',
        'reservation.reservationId',
        'reservation.subscriberId',
        'reservation.subscriptionDetailId',
        'reservation.username',
        'reservation.metadata',
        'reservation.createdAt',
      ])
      .orderBy('rle.createdAt', 'DESC');

    if (laboratoryEquipmentIds && laboratoryEquipmentIds.length > 0)
      queryBuilder.andWhere(
        'rle.laboratoryEquipmentId IN (:...laboratoryEquipmentIds)',
        {
          laboratoryEquipmentIds,
        },
      );

    if (subscriberIds && subscriberIds.length > 0)
      queryBuilder.andWhere('reservation.subscriberId IN (:...subscriberIds)', {
        subscriberIds,
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

    applyTimePeriodFilterRle(
      queryBuilder,
      timePeriod,
      startDate,
      endDate,
      dateFilterType,
    );

    if (startTime || endTime)
      applyTimeFilterRle(queryBuilder, startTime, endTime);

    const paginatedDetails = await paginateQueryBuilder(
      queryBuilder,
      paginationDto,
    );

    const foundLaboratoryEquipmentIds = [
      ...new Set(
        paginatedDetails.data
          .map((rle) => rle.laboratoryEquipmentId)
          .filter(Boolean),
      ),
    ];

    const equipmentMap = await this.reservationFindEquipmentMapService.execute(
      foundLaboratoryEquipmentIds,
    );

    const formattedData = formatAdminReservationDetailsResponse(
      paginatedDetails.data,
      equipmentMap,
    );

    return {
      data: formattedData,
      total: paginatedDetails.total,
      page: paginatedDetails.page,
      limit: paginatedDetails.limit,
      totalPages: paginatedDetails.totalPages,
    };
  }
}
