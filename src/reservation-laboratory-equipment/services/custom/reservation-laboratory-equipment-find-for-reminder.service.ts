import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { getCurrentDateInTimezone } from 'src/schedulers/helpers/timezone.helper';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

@Injectable()
export class ReservationLaboratoryEquipmentFindForReminderService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(): Promise<ReservationLaboratoryEquipment[]> {
    const now = getCurrentDateInTimezone('America/Lima');
    const lookbackMinutes = 10;
    const lookaheadHours = 24;

    const startDate = new Date(now.getTime() - lookbackMinutes * 60000);
    const endDate = new Date(now.getTime() + lookaheadHours * 3600000);

    return await this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .leftJoinAndSelect('rle.reservation', 'reservation')
      .where('rle.reservationDate >= :startDate', {
        startDate: startDate.toISOString().split('T')[0],
      })
      .andWhere('rle.reservationDate <= :endDate', {
        endDate: endDate.toISOString().split('T')[0],
      })
      .andWhere('rle.status = :status', { status: StatusReservation.PENDING })
      .getMany();
  }
}
