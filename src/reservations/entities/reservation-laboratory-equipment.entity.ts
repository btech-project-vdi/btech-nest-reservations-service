import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Timestamped } from 'src/common/entities/timestamped.entity';
import { ReservationProcessHistory } from './reservation-process-history.entity';
import { StatusReservation } from '../enums/status-reservation.enum';

@Entity({ name: 'reservationLaboratoryEquipment' })
export class ReservationLaboratoryEquipment extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  reservationLaboratoryEquipmentId: string;

  @ManyToOne(
    () => Reservation,
    (reservation) => reservation.reservationLaboratoryEquipment,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  laboratoryEquipmentId: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  subscriptionDetailId: string;

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
