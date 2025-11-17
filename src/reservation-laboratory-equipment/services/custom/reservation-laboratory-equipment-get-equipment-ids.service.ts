import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';

@Injectable()
export class ReservationLaboratoryEquipmentGetEquipmentIdsService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(): Promise<string[]> {
    const reservations: ReservationLaboratoryEquipment[] =
      await this.reservationLaboratoryEquipmentRepository
        .createQueryBuilder('rle')
        .select('DISTINCT(rle.laboratoryEquipmentId)', 'laboratoryEquipmentId')
        .getRawMany();

    return reservations.map((r) => r.laboratoryEquipmentId);
  }
}
