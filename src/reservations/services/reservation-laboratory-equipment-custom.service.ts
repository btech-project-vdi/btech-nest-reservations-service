import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusReservation } from '../enums/status-reservation.enum';
import { ConfirmListReservationResponseDto } from 'src/systems/dto/confirm-list-reservation.dto';
import { formatConfirmListReservationResponse } from '../helpers/format-confirm-list-reservation-response.helper';
import { paginate } from 'src/common/helpers/paginate.helper';
import { Paginated } from 'src/common/dto/paginated.dto';
import { CompleteFinishedReservationsResponseDto } from '../dto/complete-finished-reservations.dto';
import { ReservationsCoreService } from './reservations-core.service';

@Injectable()
export class ReservationLaboratoryEquipmentCustomService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    @Inject(forwardRef(() => ReservationsCoreService))
    private readonly reservationCoreService: ReservationsCoreService,
  ) {}

  async confirmListReservation(
    paginationDto: PaginationDto,
    status: StatusReservation | undefined,
  ): Promise<Paginated<ConfirmListReservationResponseDto>> {
    const whereCondition = status ? { status: status } : {};
    const reservationLaboratoryEquipment =
      await this.reservationLaboratoryEquipmentRepository.find({
        relations: ['reservation'],
        order: {
          createdAt: 'ASC',
        },
        where: whereCondition,
      });
    const laboratoryEquipmentIds = reservationLaboratoryEquipment.map(
      (rle) => rle.laboratoryEquipmentId,
    );
    const equipmentMap = await this.reservationCoreService.findEquipmentMapData(
      laboratoryEquipmentIds,
    );
    const confirmListReservations = formatConfirmListReservationResponse(
      reservationLaboratoryEquipment,
      equipmentMap,
    );
    return await paginate(confirmListReservations, paginationDto);
  }

  async findReservationsForReminder(): Promise<
    ReservationLaboratoryEquipment[]
  > {
    return await this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .leftJoinAndSelect('rle.reservation', 'reservation')
      .where('rle.reminderEmailSent = false')
      .andWhere('rle.reservationDate >= CURDATE()')
      .andWhere('rle.status = :status', { status: StatusReservation.PENDING })
      .getMany();
  }

  async completeFinishedReservations(
    currentDateTime: Date,
  ): Promise<CompleteFinishedReservationsResponseDto> {
    const finishedReservations =
      await this.reservationLaboratoryEquipmentRepository
        .createQueryBuilder('rle')
        .where('rle.status = :status', {
          status: StatusReservation.PENDING,
        })
        .andWhere(
          `(
          (rle.reservationFinalDate IS NULL AND
            CONCAT(rle.reservationDate, ' ', rle.finalHour) < :currentTime)
          OR
          (rle.reservationFinalDate IS NOT NULL AND
            CONCAT(rle.reservationFinalDate, ' ', rle.finalHour) < :currentTime)
        )`,
          {
            currentTime: currentDateTime
              .toISOString()
              .slice(0, 19)
              .replace('T', ' '),
          },
        )
        .getMany();

    await this.reservationLaboratoryEquipmentRepository.update(
      {
        reservationLaboratoryEquipmentId: In(
          finishedReservations.map((fr) => fr.reservationLaboratoryEquipmentId),
        ),
      },
      { status: StatusReservation.COMPLETED },
    );
    return {
      completedCount: finishedReservations.length,
      executedAt: currentDateTime,
      message: `Se completaron ${finishedReservations.length} reservas que habían terminado su tiempo programado`,
    };
  }

  async getLaboratoryEquipmentIdsWithReservations(): Promise<string[]> {
    const reservations: ReservationLaboratoryEquipment[] =
      await this.reservationLaboratoryEquipmentRepository
        .createQueryBuilder('rle')
        .select('DISTINCT(rle.laboratoryEquipmentId)', 'laboratoryEquipmentId')
        .getRawMany();

    return reservations.map((r) => r.laboratoryEquipmentId);
  }
}
