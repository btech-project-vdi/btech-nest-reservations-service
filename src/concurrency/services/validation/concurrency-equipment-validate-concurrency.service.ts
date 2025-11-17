import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { ConcurrencyEquipment } from '../../entities/concurrency-equipment.entity';
import { CheckConcurrencyDto } from '../../dto/check-concurrency.dto';
import { ConcurrencyEquipmentCustomService } from '../custom/concurrency-equipment-custom.service';
import { ConcurrencyLimitCustomService } from '../custom/concurrency-limit-custom.service';

@Injectable()
export class ConcurrencyEquipmentValidateConcurrencyService {
  constructor(
    @InjectRepository(ConcurrencyEquipment)
    private readonly concurrencyEquipmentRepository: Repository<ConcurrencyEquipment>,
    private readonly concurrencyEquipmentCustomService: ConcurrencyEquipmentCustomService,
    private readonly concurrencyLimitCustomService: ConcurrencyLimitCustomService,
  ) {}

  async execute(dto: CheckConcurrencyDto): Promise<void> {
    if (!dto.subscriptionDetailId) return;
    // PASO 1: ¿El laboratoryEquipmentId pertenece a algún grupo del tenant?
    const groupEquipment = await this.concurrencyEquipmentRepository.findOne({
      where: {
        laboratoryEquipmentId: dto.laboratoryEquipmentId,
        isActive: true,
      },
      relations: ['concurrency'],
    });
    if (!groupEquipment || !groupEquipment.concurrency) return;
    const group = groupEquipment.concurrency;
    // Validar que el grupo pertenezca al mismo tenant
    if (
      group.subscriptionDetailId !== dto.subscriptionDetailId ||
      !group.isActive
    ) {
      // Grupo de otro tenant o inactivo → No aplica límite
      return;
    }
    // PASO 2: ¿Qué límite de concurrencia aplica para este grupo + horario?
    const limit = await this.concurrencyLimitCustomService.findApplicableLimit(
      group.concurrencyId,
      dto.reservationDate,
      dto.initialHour,
      dto.finalHour,
    );
    if (!limit) {
      // No hay límite configurado para este grupo/horario
      return;
    }
    // PASO 3: ¿Cuántas reservas activas hay en este grupo que cruzan con el horario?
    const currentReservations =
      await this.concurrencyEquipmentCustomService.countReservationsInGroupByTimeRange(
        {
          concurrencyId: group.concurrencyId,
          subscriptionDetailId: dto.subscriptionDetailId,
          reservationDate: dto.reservationDate,
          initialHour: dto.initialHour,
          finalHour: dto.finalHour,
        },
      );
    // PASO 4: ¿Excede el límite?
    if (currentReservations >= limit.maxReservations)
      throw new RpcException({
        status: HttpStatus.CONFLICT,
        message: `Límite de concurrencia alcanzado para el grupo "${group.groupName}". Límite máximo: ${limit.maxReservations}, reservas actuales: ${currentReservations}`,
      });
    // ✅ Está dentro del límite, permitir
    return;
  }
}
