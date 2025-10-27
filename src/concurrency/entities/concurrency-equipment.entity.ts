import { Timestamped } from 'src/common/entities/timestamped.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Concurrency } from './concurrency.entity';

@Entity({ name: 'concurrencyEquipment' })
export class ConcurrencyEquipment extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  concurrencyEquipmentId: string;

  @ManyToOne(
    () => Concurrency,
    (concurrency) => concurrency.concurrencyEquipments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'concurrencyId' })
  concurrency: Concurrency;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  laboratoryEquipmentId: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isActive: boolean;
}
