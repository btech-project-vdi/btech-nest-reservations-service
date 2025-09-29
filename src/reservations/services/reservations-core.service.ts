import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
} from '../dto/create-reservation.dto';
import {
  FindAllReservationsDto,
  FindAllReservationsResponseDto,
} from '../dto/find-all-reservations.dto';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { Paginated } from 'src/common/dto/paginated.dto';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';

// Services
import { ReservationsValidationService } from './reservations-validation.service';
import { ReservationsAvailabilityService } from './reservations-availability.service';
import { ReservationsNotificationService } from './reservations-notification.service';
import { AdminLaboratoriesService } from '../../common/services/admin-laboratories.service';
import { TransactionService } from 'src/common/services/transaction.service';

// Helpers
import { formatReservationResponse } from '../helpers/format-reservation-response.helper';
import { formatFindReservationsResponse } from '../helpers/format-find-reservations-response.helper';
import { paginate } from 'src/common/helpers/paginate.helper';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';

@Injectable()
export class ReservationsCoreService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
    private readonly reservationsValidationService: ReservationsValidationService,
    private readonly reservationsAvailabilityService: ReservationsAvailabilityService,
    private readonly reservationsNotificationService: ReservationsNotificationService,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly transactionService: TransactionService,
  ) {}

  async createReservation(
    user: SessionUserDataDto,
    createReservationDto: CreateReservationDto,
  ): Promise<CreateReservationResponseDto> {
    const { metadata, reservationDetails, informationSubscriber } =
      createReservationDto;
    const existingUserReservations =
      await this.reservationsValidationService.prepareAndValidateReservation(
        user,
        reservationDetails,
      );
    return await this.transactionService.runInTransaction(
      async (queryRunner) => {
        await Promise.all(
          reservationDetails.map(async (detail, index) =>
            this.reservationsValidationService.validateReservationDetail(
              detail,
              index,
              user,
              user.subscriberId,
              existingUserReservations,
              this.reservationsAvailabilityService.validateHoursDisponibility.bind(
                this.reservationsAvailabilityService,
              ),
            ),
          ),
        );

        const reservation = queryRunner.manager.create(Reservation, {
          subscriberId: user.subscriberId,
          username: user.username,
          metadata: metadata ?? {
            'Fecha de creación': new Date().toISOString(),
            'Codigo de usuario': user.username,
          },
          reservationLaboratoryEquipment: await Promise.all(
            reservationDetails.map((detail) =>
              this.reservationLaboratoryEquipmentService.create(
                detail,
                informationSubscriber,
                queryRunner,
              ),
            ),
          ),
        });

        const reservationSaved = await queryRunner.manager.save(reservation);
        const reservationFormatted =
          formatReservationResponse(reservationSaved);

        const laboratoryEquipmentIds =
          reservationFormatted.reservationLaboratoryEquipment.map(
            (rle) => rle.laboratoryEquipmentId,
          );
        const equipmentMap = await this.findEquipmentMapData(
          laboratoryEquipmentIds,
        );
        this.reservationsNotificationService.sendEmailForConfirmationReservation(
          reservationFormatted,
          informationSubscriber,
          equipmentMap,
        );
        return reservationFormatted;
      },
    );
  }

  async findAll(
    user: SessionUserDataDto,
    findAllReservationsDto: FindAllReservationsDto,
  ): Promise<Paginated<FindAllReservationsResponseDto>> {
    const { status, itemPage, itemLimit, ...paginationDto } =
      findAllReservationsDto;
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
      ])
      .where('reservation.subscriberId = :subscriberId', {
        subscriberId: user.subscriberId,
      })
      .orderBy('reservation.createdAt', 'DESC');

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

    const equipmentMap = await this.findEquipmentMapData(
      laboratoryEquipmentIds,
    );
    const reservationsResponseFormat = formatFindReservationsResponse(
      reservations,
      equipmentMap,
      { itemPage, itemLimit },
    );

    return paginate(reservationsResponseFormat, paginationDto);
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
}
