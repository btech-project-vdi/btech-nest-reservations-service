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
import {
  FindAvailableLaboratoriesEquipmentsForUserDto,
  FindAvailableLaboratoriesEquipmentsForUserResponseDto,
} from 'src/common/dto/find-available-laboratories-equipments-for-user.dto';
import { formatFindAvailableLaboratoriesForUserResponse } from '../helpers/format-find-available-laboratories-for-user-response.helper';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';
import { calculateTimePeriodDates } from '../helpers/calculate-time-period-dates.helper';

@Injectable()
export class ReservationsAdminService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly subscribersClient: SubscribersClient,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  async findAdminReservations(
    findAdminReservationsDto: FindAdminReservationsDto,
  ): Promise<Paginated<FindAdminReservationsResponseDto>> {
    const {
      laboratoryEquipmentId,
      subscriberId,
      reservationId,
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
    if (reservationId)
      queryBuilder.andWhere('reservation.reservationId = :reservationId', {
        reservationId,
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

    const { fromDate, toDate } = calculateTimePeriodDates(
      timePeriod,
      startDate,
      endDate,
    );

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
    if (startTime)
      queryBuilder.andWhere('rle.initialHour >= :startTime', { startTime });
    if (endTime)
      queryBuilder.andWhere('rle.finalHour <= :endTime', { endTime });
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
    const { term, page, limit, ...restDto } = findSubscribersListDto;

    const baseQuery = this.reservationRepository
      .createQueryBuilder('reservation')
      .select('reservation.subscriberId', 'subscriberId')
      .groupBy('reservation.subscriberId')
      .orderBy('MAX(reservation.createdAt)', 'DESC');

    const [reservations, total] = await Promise.all([
      baseQuery
        .clone()
        .limit(limit || 10)
        .offset(((page || 1) - 1) * (limit || 10))
        .getRawMany<{ subscriberId: string }>(),
      baseQuery.clone().getCount(),
    ]);

    const subscriberIds = reservations.map((r) => r.subscriberId);

    if (subscriberIds.length === 0)
      return {
        data: [],
        total: 0,
        page: page || 1,
        limit: limit || 10,
        totalPages: 0,
      };

    const grpcDto: FindSubscribersWithNaturalPersonsDto = {
      subscriptionDetailId: restDto.subscriptionDetailId,
      page: 1,
      limit: subscriberIds.length,
      term: term?.trim() || undefined,
      subscriberIds,
    };

    const response =
      await this.subscribersClient.findSubscribersWithNaturalPersons(grpcDto);

    return {
      ...response,
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / (limit || 10)),
    };
  }

  async findAvailableLaboratoriesEquipmentsForUserWithReservations(
    findAvailableLaboratoriesEquipmentsForUserDto: FindAvailableLaboratoriesEquipmentsForUserDto,
  ): Promise<Paginated<FindAvailableLaboratoriesEquipmentsForUserResponseDto>> {
    const allLaboratories =
      await this.adminLaboratoriesService.findAvailableLaboratoriesEquipmentsForUser(
        findAvailableLaboratoriesEquipmentsForUserDto,
      );
    const laboratoryEquipmentIdsWithReservations =
      await this.reservationLaboratoryEquipmentService.getLaboratoryEquipmentIdsWithReservations();
    const filteredLaboratories = formatFindAvailableLaboratoriesForUserResponse(
      allLaboratories.data,
      laboratoryEquipmentIdsWithReservations,
    );
    return {
      data: filteredLaboratories,
      total: filteredLaboratories.length,
      page: allLaboratories.page,
      limit: allLaboratories.limit,
      totalPages: Math.ceil(
        filteredLaboratories.length / allLaboratories.limit,
      ),
    };
  }
}
