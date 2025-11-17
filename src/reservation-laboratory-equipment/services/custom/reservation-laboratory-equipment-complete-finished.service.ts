import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { CompleteFinishedReservationsResponseDto } from 'src/reservation/dto/complete-finished-reservations.dto';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

@Injectable()
export class ReservationLaboratoryEquipmentCompleteFinishedService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(
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
}
