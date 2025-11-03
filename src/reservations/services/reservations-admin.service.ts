import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import {
  FindAdminReservationsDto,
  FindAdminReservationsResponseDto,
} from '../dto/find-admin-reservations.dto';
import { TimePeriod } from '../enums/time-period.enum';
import { DateFilterType } from '../enums/date-filter-type.enum';
import { Paginated } from 'src/common/dto/paginated.dto';
import { paginateQueryBuilder } from 'src/common/helpers/paginate-query-builder.helper';
import { formatFindReservationsResponse } from '../helpers/format-find-reservations-response.helper';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { FindSubscribersListDto } from '../dto/find-subscribers-list.dto';
import { FindSubscribersWithNaturalPersonsResponseDto } from 'src/grpc/dto/find-subscribers-with-natural-persons.dto';
import {
  FindAvailableLaboratoriesEquipmentsForUserDto,
  FindAvailableLaboratoriesEquipmentsForUserResponseDto,
} from 'src/common/dto/find-available-laboratories-equipments-for-user.dto';
import { formatFindAvailableLaboratoriesForUserResponse } from '../helpers/format-find-available-laboratories-for-user-response.helper';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';
import { calculateTimePeriodDates } from '../helpers/calculate-time-period-dates.helper';
import { formatSubscribersListResponse } from '../helpers/format-subscribers-list-response.helper';

@Injectable()
export class ReservationsAdminService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  async findAdminReservations(
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
    this.applyTimePeriodFilter(
      queryBuilder,
      timePeriod,
      startDate,
      endDate,
      dateFilterType,
    );
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
    dateFilterType?: DateFilterType,
  ): void {
    if (!timePeriod) return;

    const { fromDate, toDate } = calculateTimePeriodDates(
      timePeriod,
      startDate,
      endDate,
    );

    if (fromDate && toDate) {
      const filterType =
        dateFilterType || DateFilterType.RESERVATION_START_DATE;
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
    const { term, page = 1, limit = 10 } = findSubscribersListDto;

    const subQuery = this.reservationRepository
      .createQueryBuilder('r')
      .select('r.subscriberId', 'subscriberId')
      .addSelect('MAX(r.createdAt)', 'maxCreatedAt')
      .groupBy('r.subscriberId');

    if (term?.trim()) {
      const trimmedTerm = term.trim();
      const searchPattern = `%${trimmedTerm.toLowerCase()}%`;

      // Para nombres (fullName, paternalSurname, maternalSurname): búsqueda flexible por palabras en cualquier orden
      const words = trimmedTerm.split(/\s+/);
      const nameConditions = words
        .map(
          (_, index) =>
            `(LOWER(JSON_EXTRACT(r.metadata, '$.naturalPerson.fullName')) LIKE :nameWord${index} OR
            LOWER(JSON_EXTRACT(r.metadata, '$.naturalPerson.paternalSurname')) LIKE :nameWord${index} OR
            LOWER(JSON_EXTRACT(r.metadata, '$.naturalPerson.maternalSurname')) LIKE :nameWord${index})`,
        )
        .join(' AND ');

      const parameters: Record<string, string> = {};
      words.forEach((word, index) => {
        parameters[`nameWord${index}`] = `%${word.toLowerCase()}%`;
      });
      parameters['searchPattern'] = searchPattern;

      // Para otros campos: búsqueda directa case-insensitive
      const directSearchConditions = `(
        LOWER(r.username) LIKE :searchPattern OR
        LOWER(JSON_EXTRACT(r.metadata, '$.naturalPerson.documentType')) LIKE :searchPattern OR
        LOWER(JSON_EXTRACT(r.metadata, '$.naturalPerson.documentNumber')) LIKE :searchPattern OR
        LOWER(JSON_EXTRACT(r.metadata, '$."Codigo de usuario"')) LIKE :searchPattern OR
        LOWER(JSON_SEARCH(r.metadata, 'one', :searchPattern, NULL, '$.naturalPerson.personInformation[*].description')) IS NOT NULL
      )`;

      // Combinar ambas condiciones: nombres flexibles O búsqueda directa
      const fullCondition = `((${nameConditions}) OR ${directSearchConditions})`;

      subQuery.andWhere(fullCondition, parameters);
    }

    const subscriberIdsSubQuery = `(${subQuery.getQuery()})`;

    const queryBuilder = this.reservationRepository
      .createQueryBuilder('reservation')
      .innerJoin(
        subscriberIdsSubQuery,
        'sub',
        'reservation.subscriberId = sub.subscriberId AND reservation.createdAt = sub.maxCreatedAt',
      )
      .setParameters(subQuery.getParameters())
      .orderBy('reservation.createdAt', 'DESC');

    const paginatedReservations = await paginateQueryBuilder(queryBuilder, {
      page,
      limit,
    });

    const data = formatSubscribersListResponse(paginatedReservations.data);

    return {
      data,
      total: paginatedReservations.total,
      page: paginatedReservations.page,
      limit: paginatedReservations.limit,
      totalPages: paginatedReservations.totalPages,
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
