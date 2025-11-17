import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConcurrencyEquipment } from '../../entities/concurrency-equipment.entity';
import { CountReservationsInGroupDto } from '../../dto/count-reservations-in-group.dto';
import { ReservationLaboratoryEquipment } from 'src/reservation-laboratory-equipment/entities/reservation-laboratory-equipment.entity';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

@Injectable()
export class ConcurrencyEquipmentCountReservationsInGroupService {
  constructor(
    @InjectRepository(ConcurrencyEquipment)
    private readonly concurrencyEquipmentRepository: Repository<ConcurrencyEquipment>,
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(dto: CountReservationsInGroupDto): Promise<number> {
    // Obtener todos los laboratoryEquipmentId que pertenecen al grupo
    const equipments = await this.concurrencyEquipmentRepository.find({
      where: {
        concurrency: { concurrencyId: dto.concurrencyId },
        isActive: true,
      },
      select: ['laboratoryEquipmentId'],
    });
    if (equipments.length === 0) return 0;
    const equipmentIds = equipments.map((e) => e.laboratoryEquipmentId);
    // Contar reservationLaboratoryEquipment que:
    // 1. Pertenezcan a equipos del grupo
    // 2. Pertenezcan al mismo tenant (subscriptionDetailId)
    // 3. Tengan la misma fecha
    // 4. Se crucen en horario
    // 5. Estén activas (PENDIENTE o CONFIRMADO)
    const queryBuilder = this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .where('rle.laboratoryEquipmentId IN (:...equipmentIds)', {
        equipmentIds,
      })
      .andWhere('rle.reservationDate = :date', { date: dto.reservationDate })
      .andWhere('rle.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .andWhere(
        '(rle.initialHour < :finalHour AND rle.finalHour > :initialHour)',
        {
          initialHour: dto.initialHour,
          finalHour: dto.finalHour,
        },
      );
    // Filtrar por subscriptionDetailId si se proporciona
    if (dto.subscriptionDetailId)
      queryBuilder.andWhere(
        'rle.subscriptionDetailId = :subscriptionDetailId',
        {
          subscriptionDetailId: dto.subscriptionDetailId,
        },
      );
    const count = await queryBuilder.getCount();
    return count;
  }
}
