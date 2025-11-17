import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { FindSubscribersWithNaturalPersonsResponseDto } from 'src/communications/grpc/dto/find-subscribers-with-natural-persons.dto';
import { paginateQueryBuilder } from 'src/common/helpers/paginate-query-builder.helper';
import { FindSubscribersListDto } from 'src/reservation/dto/find-subscribers-list.dto';
import { formatSubscribersListResponse } from 'src/reservation/helpers/format-subscribers-list-response.helper';

@Injectable()
export class ReservationFindSubscribersListService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async execute(
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
}
