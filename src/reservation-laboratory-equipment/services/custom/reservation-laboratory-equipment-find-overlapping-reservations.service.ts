import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';
@Injectable()
export class ReservationLaboratoryEquipmentFindOverlappingReservationsService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(
    laboratoryEquipmentId: string,
    reservationDate: Date,
    initialHour: string,
    finalHour: string,
  ): Promise<ReservationLaboratoryEquipment[]> {
    const date = reservationDate.toISOString().split('T')[0];
    // Usar exactamente la misma lógica que checkAvailabilityBatch
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
    return await this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .where('rle.laboratoryEquipmentId = :laboratoryEquipmentId', {
        laboratoryEquipmentId,
      })
      .andWhere('rle.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .andWhere(
        // Exactamente la misma lógica de superposición que checkAvailabilityBatch
        `:newResStart < CAST(CASE
          WHEN rle.reservationFinalDate IS NOT NULL AND rle.reservationFinalDate > rle.reservationDate
          THEN CONCAT(rle.reservationFinalDate, ' ', rle.finalHour)
          ELSE CONCAT(rle.reservationDate, ' ', rle.finalHour)
        END AS DATETIME) AND :newResEnd > CAST(CONCAT(rle.reservationDate, ' ', rle.initialHour) AS DATETIME)`,
        {
          newResStart: newReservationStartDateTime,
          newResEnd: newReservationEndDateTime,
        },
      )
      .getMany();
  }
}
