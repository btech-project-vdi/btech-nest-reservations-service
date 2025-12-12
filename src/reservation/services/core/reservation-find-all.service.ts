import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { paginate } from 'src/common/helpers/paginate.helper';
import {
  FindAllReservationsDto,
  FindAllReservationsResponseDto,
} from 'src/reservation/dto/find-all-reservations.dto';
import { formatFindReservationsResponse } from 'src/reservation/helpers/format-find-reservations-response.helper';
import { ReservationFindEquipmentMapService } from '../custom';
import { PaginationResponseDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReservationFindAllService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly reservationFindEquipmentMapService: ReservationFindEquipmentMapService,
  ) {}

  async execute(
    user: SessionUserDataDto,
    findAllReservationsDto: FindAllReservationsDto,
  ): Promise<PaginationResponseDto<FindAllReservationsResponseDto>> {
    const { status, itemPage, itemLimit, ...paginationDto } =
      findAllReservationsDto;
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
      ])
      .where('reservation.subscriberId = :subscriberId', {
        subscriberId: user.subscriberId,
      })
      .orderBy('reservation.createdAt', 'DESC');

    if (user.subscription?.subscriptionDetailId) {
      queryBuilder.andWhere(
        'reservation.subscriptionDetailId = :subscriptionDetailId',
        {
          subscriptionDetailId: user.subscription.subscriptionDetailId,
        },
      );
    }

    if (status)
      queryBuilder.andWhere('rle.status IN (:...status)', {
        status: Array.isArray(status) ? status : [status],
      });

    const reservations = await queryBuilder.getMany();
    const laboratoryEquipmentIds = [
      ...new Set(
        reservations
          .flatMap((r) => r.reservationLaboratoryEquipment)
          .map((rle) => rle.laboratoryEquipmentId)
          .filter(Boolean),
      ),
    ];

    const equipmentMap = await this.reservationFindEquipmentMapService.execute(
      laboratoryEquipmentIds,
    );
    const reservationsResponseFormat = formatFindReservationsResponse(
      reservations,
      equipmentMap,
      { itemPage, itemLimit },
    );

    return paginate(reservationsResponseFormat, paginationDto);
  }
}
