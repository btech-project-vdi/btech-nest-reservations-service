import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { Repository } from 'typeorm';
import { StatusReservation } from '../enums/status-reservation.enum';
import {
  FindReservationsByEquipmentAndDateRangeDto,
  FindReservationsByEquipmentAndDateRangeResponseDto,
} from '../dto/find-reservations-by-equipment-and-date-range.dto';
import { formatFindReservationsRangeResponse } from '../helpers/format-find-reservations-range-response.dto';

@Injectable()
export class ReservationLaboratoryEquipmentService {
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
}
