import { Timestamped } from 'src/common/entities/timestamped.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConcurrencyEquipment } from './concurrency-equipment.entity';
import { ConcurrencyLimit } from './concurrency-limit.entity';

@Entity({ name: 'concurrency' })
export class Concurrency extends Timestamped {
  @PrimaryGeneratedColumn('uuid')
  concurrencyId: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  subscriptionDetailId: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  groupName: string;

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

  @OneToMany(() => ConcurrencyEquipment, (equipment) => equipment.concurrency, {
    cascade: true,
  })
  concurrencyEquipments: ConcurrencyEquipment[];

  @OneToMany(() => ConcurrencyLimit, (limit) => limit.concurrency)
  concurrencyLimits: ConcurrencyLimit[];
}
