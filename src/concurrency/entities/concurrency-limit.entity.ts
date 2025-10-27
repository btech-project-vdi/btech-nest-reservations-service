import { Timestamped } from 'src/common/entities/timestamped.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Concurrency } from './concurrency.entity';
import { ConcurrencyTimeSlot } from './concurrency-time-slot.entity';

@Entity({ name: 'concurrencyLimit' })
export class ConcurrencyLimit extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  concurrencyLimitId: string;

  @ManyToOne(
    () => Concurrency,
    (concurrency) => concurrency.concurrencyLimits,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'concurrencyId' })
  concurrency: Concurrency;

  @ManyToOne(
    () => ConcurrencyTimeSlot,
    (timeSlot) => timeSlot.concurrencyLimits,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'concurrencyTimeSlotId' })
  concurrencyTimeSlot: ConcurrencyTimeSlot;

  @Column({
    type: 'int',
    nullable: false,
  })
  maxReservations: number;

  @Column({
    type: 'date',
    nullable: false,
  })
  effectiveFrom: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  effectiveTo: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'json',
    nullable: true,
  })
  metadata: Record<string, any>;
}
