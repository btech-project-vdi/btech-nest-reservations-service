import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { Brackets, In, QueryRunner, Repository } from 'typeorm';
import { StatusReservation } from '../enums/status-reservation.enum';
import {
  FindReservationsByEquipmentAndDateRangeDto,
  FindReservationsByEquipmentAndDateRangeResponseDto,
} from '../dto/find-reservations-by-equipment-and-date-range.dto';
import { formatFindReservationsRangeResponse } from '../helpers/format-find-reservations-range-response.dto';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { RpcException } from '@nestjs/microservices';
import { UpdateReservationStatusDto } from '../dto/update-reservation-status.dto';
import { ResponseBaseMessageDto } from '../dto/response-base-message.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfirmListReservationResponseDto } from 'src/systems/dto/confirm-list-reservation.dto';
import { formatConfirmListReservationResponse } from '../helpers/format-confirm-list-reservation-response.helper';
import { paginate } from 'src/common/helpers/paginate.helper';
import { Paginated } from 'src/common/dto/paginated.dto';
import { CompleteFinishedReservationsResponseDto } from '../dto/complete-finished-reservations.dto';
import { ReservationsCoreService } from './reservations-core.service';

@Injectable()
export class ReservationLaboratoryEquipmentService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    @Inject(forwardRef(() => ReservationsCoreService))
    private readonly reservationCoreService: ReservationsCoreService,
  ) {}
  async create(
    createReservationDetailDto: CreateReservationDetailDto,
    queryRunner?: QueryRunner,
  ): Promise<ReservationLaboratoryEquipment> {
    const [year, month, day] = createReservationDetailDto.initialDate
      .split('-')
      .map(Number);
    const [finalYear, finalMonth, finalDay] =
      createReservationDetailDto.finalDate.split('-').map(Number);
    const repository = queryRunner
      ? queryRunner.manager.getRepository(ReservationLaboratoryEquipment)
      : this.reservationLaboratoryEquipmentRepository;
    const reservationDetail = repository.create({
      metadata: {},
      laboratoryEquipmentId: createReservationDetailDto.laboratoryEquipmentId,
      reservationDate: new Date(year, month - 1, day),
      initialHour: createReservationDetailDto.initialHour,
      reservationFinalDate: new Date(finalYear, finalMonth - 1, finalDay),
      finalHour: createReservationDetailDto.finalHour,
    });
    return await repository.save(reservationDetail);
  }

  async updateStatus(
    updateReservationStatusDto: UpdateReservationStatusDto,
  ): Promise<ResponseBaseMessageDto> {
    const { reservationLaboratoryEquipmentId, status } =
      updateReservationStatusDto;
    const reservationLaboratory =
      await this.reservationLaboratoryEquipmentRepository.update(
        { reservationLaboratoryEquipmentId },
        { status, updatedAt: new Date() },
      );
    if (reservationLaboratory.affected === 0)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `La reserva no se encuentra registrada`,
      });
    return {
      message: `El item de reserva con el id ${reservationLaboratoryEquipmentId} fue actualizado con el estado ${status}`,
    };
  }

  async findReservationsByEquipmentAndDateRange(
    findReservationsByEquipmentAndDateRangeDto: FindReservationsByEquipmentAndDateRangeDto,
  ): Promise<FindReservationsByEquipmentAndDateRangeResponseDto[]> {
    const { laboratoryEquipmentId, initialDate, finalDate } =
      findReservationsByEquipmentAndDateRangeDto;
    const initialDateObj = new Date(initialDate);
    const finalDateObj = new Date(finalDate);
    const existingReservations =
      await this.reservationLaboratoryEquipmentRepository
        .createQueryBuilder('rle')
        .where('rle.laboratoryEquipmentId = :laboratoryEquipmentId', {
          laboratoryEquipmentId,
        })
        .andWhere(
          '((rle.reservationDate <= :finalDate AND rle.reservationFinalDate >= :initialDate) OR ' +
            '(rle.reservationDate <= :finalDate AND rle.reservationFinalDate IS NULL))',
          {
            initialDate: initialDateObj.toISOString().split('T')[0],
            finalDate: finalDateObj.toISOString().split('T')[0],
          },
        )
        .andWhere('rle.status IN (:...statuses)', {
          statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
        })
        .getMany();
    return existingReservations.map(formatFindReservationsRangeResponse);
  }

  async findReservationsByUserAndDateRange(
    userId: string,
    initialDate: Date,
    finalDate: Date,
  ): Promise<ReservationLaboratoryEquipment[]> {
    const initialDateISO = initialDate.toISOString().split('T')[0];
    const finalDateISO = finalDate.toISOString().split('T')[0];

    return await this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .leftJoinAndSelect('rle.reservation', 'r')
      .where('r.subscriberId = :userId', { userId })
      .andWhere('rle.reservationDate >= :initialDate', {
        initialDate: initialDateISO,
      })
      .andWhere('rle.reservationDate <= :finalDate', {
        finalDate: finalDateISO,
      })
      .andWhere('rle.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .getMany();
  }

  async checkAvailability(
    labEquipmentId: string,
    date: string,
    initialHour: string,
    finalHour: string,
  ): Promise<number> {
    const newReservationStartDateTime = `${date} ${initialHour}`;
    let newReservationEndDateTime: string;

    const initialMinutes =
      parseInt(initialHour.split(':')[0]) * 60 +
      parseInt(initialHour.split(':')[1]);
    const finalMinutes =
      parseInt(finalHour.split(':')[0]) * 60 +
      parseInt(finalHour.split(':')[1]);

    if (finalMinutes <= initialMinutes) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayFormatted = nextDay.toISOString().split('T')[0];
      newReservationEndDateTime = `${nextDayFormatted} ${finalHour}`;
    } else {
      newReservationEndDateTime = `${date} ${finalHour}`;
    }

    return this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .where('rle.laboratoryEquipmentId = :labEquipmentId', {
        labEquipmentId,
      })
      .andWhere('rle.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .andWhere(
        new Brackets((qb) => {
          // Convertir a DATETIME/TIMESTAMP para una comparación precisa
          const rleStart = `CAST(CONCAT(rle.reservationDate, ' ', rle.initialHour) AS DATETIME)`;

          const rleEnd = `
        CAST(CASE
          WHEN rle.reservationFinalDate IS NOT NULL AND rle.reservationFinalDate > rle.reservationDate
          THEN CONCAT(rle.reservationFinalDate, ' ', rle.finalHour)
          ELSE CONCAT(rle.reservationDate, ' ', rle.finalHour)
        END AS DATETIME)
      `;
          // La condición universal de solapamiento: (StartA < EndB) AND (EndA > StartB)
          qb.where(`:newResStart < ${rleEnd} AND :newResEnd > ${rleStart}`, {
            newResStart: newReservationStartDateTime, // Ya calculado correctamente en TS
            newResEnd: newReservationEndDateTime, // Ya calculado correctamente en TS
          });
        }),
      )
      .getCount();
  }

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
          { currentTime: currentDateTime },
        )
        .getMany();

    if (finishedReservations.length > 0)
      await this.reservationLaboratoryEquipmentRepository.update(
        {
          reservationLaboratoryEquipmentId: In(
            finishedReservations.map((r) => r.reservationLaboratoryEquipmentId),
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
}
