import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Timestamped } from 'src/common/entities/timestamped.entity';
import { ReservationProcessHistory } from './reservation-process-history.entity';
import { StatusReservation } from '../enums/status-reservation.enum';

@Entity()
export class ReservationLaboratoryEquipment extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  reservationLaboratoryEquipeId: string;

  @ManyToOne(
    () => Reservation,
    (reservation) => reservation.reservationLaboratoryEquipment,
  )
  reservation: Reservation;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  laboratoryEquipmentId: string;

  @OneToMany(
    () => ReservationProcessHistory,
    (reservationProcessHistory) =>
      reservationProcessHistory.reservationLaboratoryEquipe,
  )
  reservationProcessHistory: ReservationProcessHistory[];

  @Column({
    type: 'date',
    nullable: false,
  })
  reservationDate: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  reservationFinalDate: Date;

  @Column({
    type: 'time',
    nullable: false,
  })
  initialHour: string;

  @Column({
    type: 'time',
    nullable: false,
  })
  finalHour: string;

  @Column({
    type: 'json',
    nullable: false,
  })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: StatusReservation,
    nullable: false,
  })
  status: StatusReservation;
}
