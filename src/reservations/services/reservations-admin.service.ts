import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import {
  FindAdminReservationsDto,
  FindAdminReservationsResponseDto,
} from '../dto/find-admin-reservations.dto';
import { TimePeriod } from '../enums/time-period.enum';
import { Paginated } from 'src/common/dto/paginated.dto';
import { paginateQueryBuilder } from 'src/common/helpers/paginate-query-builder.helper';
import { formatFindReservationsResponse } from '../helpers/format-find-reservations-response.helper';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { FindSubscribersListDto } from '../dto/find-subscribers-list.dto';
import { SubscribersClient } from 'src/grpc/clients/subscribers.client';
import {
  FindSubscribersWithNaturalPersonsDto,
  FindSubscribersWithNaturalPersonsResponseDto,
} from 'src/grpc/dto/find-subscribers-with-natural-persons.dto';
import { filterSubscribersByTerm } from '../helpers/filter-subscribers-by-term.helper';

@Injectable()
export class ReservationsAdminService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly subscribersClient: SubscribersClient,
  ) {}

  async findAdminReservations(
    findAdminReservationsDto: FindAdminReservationsDto,
  ): Promise<Paginated<FindAdminReservationsResponseDto>> {
    const {
      laboratoryEquipmentId,
      subscriberId,
      timePeriod,
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
        'reservation.username',
        'reservation.metadata',
        'reservation.createdAt',
        'rle.reservationLaboratoryEquipmentId',
        'rle.laboratoryEquipmentId',
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
    this.applyTimePeriodFilter(queryBuilder, timePeriod, startDate, endDate);
    if (startTime || endTime)
      this.applyTimeFilter(queryBuilder, startTime, endTime);
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
    const equipmentMap = await this.findEquipmentMapData(
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

  private applyTimePeriodFilter(
    queryBuilder: SelectQueryBuilder<Reservation>,
    timePeriod?: TimePeriod,
    startDate?: string,
    endDate?: string,
  ): void {
    if (!timePeriod) return;

    const now = new Date();
    let fromDate: Date | undefined;
    let toDate: Date = now;

    switch (timePeriod) {
      case TimePeriod.CUSTOM:
        if (startDate && endDate) {
          fromDate = new Date(startDate);
          toDate = new Date(endDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;

      case TimePeriod.LAST_DAY:
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 1);
        break;

      case TimePeriod.LAST_WEEK:
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        break;

      case TimePeriod.LAST_30_DAYS:
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 30);
        break;

      case TimePeriod.LAST_3_MONTHS:
        fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 3);
        break;

      case TimePeriod.LAST_YEAR:
        fromDate = new Date(now);
        fromDate.setFullYear(now.getFullYear() - 1);
        break;

      case TimePeriod.CURRENT_MONTH:
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        toDate.setHours(23, 59, 59, 999);
        break;
    }

    if (fromDate && toDate)
      queryBuilder.andWhere(
        'rle.reservationDate BETWEEN :fromDate AND :toDate',
        {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        },
      );
  }

  private applyTimeFilter(
    queryBuilder: SelectQueryBuilder<Reservation>,
    startTime?: string,
    endTime?: string,
  ): void {
    if (startTime) {
      queryBuilder.andWhere('rle.initialHour >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('rle.finalHour <= :endTime', { endTime });
    }
  }

  async findEquipmentMapData(
    laboratoryEquipmentIds: string[],
  ): Promise<
    Map<string, FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto>
  > {
    const equipmentDataPromises = laboratoryEquipmentIds.map((id) =>
      this.adminLaboratoriesService.findLaboratoryEquipmentByLaboratoryEquipmentId(
        id,
      ),
    );
    const equipmentData = await Promise.all(equipmentDataPromises);
    const equipmentMap = new Map(
      equipmentData.map((equipment) => [
        equipment.laboratoryEquipmentId,
        equipment,
      ]),
    );
    return equipmentMap;
  }

  async findSubscribersList(
    findSubscribersListDto: FindSubscribersListDto,
  ): Promise<FindSubscribersWithNaturalPersonsResponseDto> {
    const { term, ...restDto } = findSubscribersListDto;
    const grpcDto: FindSubscribersWithNaturalPersonsDto = {
      subscriptionDetailId: restDto.subscriptionDetailId,
      page: restDto.page || 1,
      limit: restDto.limit || 10,
    };
    const response =
      await this.subscribersClient.findSubscribersWithNaturalPersons(grpcDto);
    if (!term || term.trim() === '') return response;
    const filteredData = filterSubscribersByTerm(response.data, term);
    return {
      ...response,
      data: filteredData,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / (restDto.limit || 10)),
    };
  }
}
