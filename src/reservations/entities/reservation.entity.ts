import { Timestamped } from 'src/common/entities/timestamped.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReservationLaboratoryEquipment } from './reservation-laboratory-equipment.entity';

@Entity({ name: 'reservation' })
export class Reservation extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  reservationId: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  subscriberId: string;

  @Column({
    type: 'varchar',
    length: 65,
    nullable: true,
  })
  username: string;

  @OneToMany(
    () => ReservationLaboratoryEquipment,
    (reservationLaboratoryEquipe) => reservationLaboratoryEquipe.reservation,
    { cascade: true },
  )
  reservationLaboratoryEquipment: ReservationLaboratoryEquipment[];

  @Column({
    type: 'json',
    nullable: false,
  })
  metadata: Record<string, any>;
}
