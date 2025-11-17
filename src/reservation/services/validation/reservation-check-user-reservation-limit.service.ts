import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { RpcException } from '@nestjs/microservices';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

@Injectable()
export class ReservationCheckUserReservationLimitService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async execute(
    userId: string,
    date: string,
    numberReservationDays: number,
  ): Promise<void> {
    const reservationsCount = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin(
        'reservation.reservationLaboratoryEquipment',
        'reservationLaboratoryEquipment',
      )
      .where('reservation.subscriberId = :userId', { userId })
      .andWhere('reservationLaboratoryEquipment.reservationDate = :date', {
        date,
      })
      .andWhere('reservationLaboratoryEquipment.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .getCount();
    if (reservationsCount >= numberReservationDays)
      throw new RpcException({
        status: 400,
        message: `El usuario ha alcanzado el límite de reservas para la fecha: ${date}`,
      });
  }
}
