import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { Brackets, QueryRunner, Repository } from 'typeorm';
import { StatusReservation } from '../enums/status-reservation.enum';
import {
  FindReservationsByEquipmentAndDateRangeDto,
  FindReservationsByEquipmentAndDateRangeResponseDto,
} from '../dto/find-reservations-by-equipment-and-date-range.dto';
import { formatFindReservationsRangeResponse } from '../helpers/format-find-reservations-range-response.dto';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';

@Injectable()
export class ReservationLaboratoryEquipmentService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
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
    return await this.reservationLaboratoryEquipmentRepository.save(
      reservationDetail,
    );
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
}
