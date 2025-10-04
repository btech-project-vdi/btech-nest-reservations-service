import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import {
  FindReservationsByEquipmentAndDateRangeDto,
  FindReservationsByEquipmentAndDateRangeResponseDto,
} from '../dto/find-reservations-by-equipment-and-date-range.dto';
import { formatFindReservationsRangeResponse } from '../helpers/format-find-reservations-range-response.dto';
import { StatusReservation } from '../enums/status-reservation.enum';

@Injectable()
export class ReservationLaboratoryEquipmentValidateService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

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

  async checkAvailabilityBatch(
    labEquipmentIds: string[],
    date: string,
    initialHour: string,
    finalHour: string,
  ): Promise<Map<string, number>> {
    if (!labEquipmentIds || labEquipmentIds.length === 0) return new Map();

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

    const results = await this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .select('rle.laboratoryEquipmentId', 'laboratoryEquipmentId')
      .addSelect('COUNT(*)', 'count')
      .where('rle.laboratoryEquipmentId IN (:...labEquipmentIds)', {
        labEquipmentIds,
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
          qb.where(`:newResStart < ${rleEnd} AND :newResEnd > ${rleStart}`, {
            newResStart: newReservationStartDateTime,
            newResEnd: newReservationEndDateTime,
          });
        }),
      )
      .groupBy('rle.laboratoryEquipmentId')
      .getRawMany<{ laboratoryEquipmentId: string; count: string }>();

    // Convertir resultados a Map para lookup rápido
    const countMap = new Map<string, number>();
    // Inicializar todos los equipos con 0
    labEquipmentIds.forEach((id) => countMap.set(id, 0));
    // Actualizar con los valores reales
    results.forEach((result) => {
      countMap.set(result.laboratoryEquipmentId, parseInt(result.count, 10));
    });

    return countMap;
  }
}
