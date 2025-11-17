import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

@Injectable()
export class ReservationLaboratoryEquipmentFindByUserRangeService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(
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
}
