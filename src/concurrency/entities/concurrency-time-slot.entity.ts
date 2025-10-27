import { Timestamped } from 'src/common/entities/timestamped.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConcurrencyLimit } from './concurrency-limit.entity';

@Entity({ name: 'concurrencyTimeSlot' })
export class ConcurrencyTimeSlot extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  concurrencyTimeSlotId: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  subscriptionDetailId: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  slotName: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  startTime: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  endTime: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isGeneral: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

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

  @OneToMany(() => ConcurrencyLimit, (limit) => limit.concurrencyTimeSlot)
  concurrencyLimits: ConcurrencyLimit[];
}
