import { Timestamped } from 'src/common/entities/timestamped.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReservationLaboratoryEquipment } from './reservation-laboratory-equipment.entity';
import { StatusResponse } from '../enums/status-response.enum';

@Entity({ name: 'reservationProcessHistory' })
export class ReservationProcessHistory extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  reservationProcessHistoryId: string;

  @ManyToOne(
    () => ReservationLaboratoryEquipment,
    (reservationLaboratoryEquipment) =>
      reservationLaboratoryEquipment.reservationProcessHistory,
  )
  @JoinColumn({ name: 'reservationLaboratoryEquipmentId' })
  reservationLaboratoryEquipe: ReservationLaboratoryEquipment;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  message: string;

  @Column({
    type: 'enum',
    enum: StatusResponse,
    nullable: false,
  })
  status: StatusResponse;

  @Column({
    type: 'int',
    nullable: false,
  })
  statusCode: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  metadata: Record<string, string>;
}
