import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { ConcurrencyEquipment } from '../entities/concurrency-equipment.entity';
import { ConcurrencyLimit } from '../entities/concurrency-limit.entity';
import { CheckConcurrencyDto } from '../dto/check-concurrency.dto';
import { ConcurrencyCustomService } from './concurrency-custom.service';

@Injectable()
export class ConcurrencyValidateService {
  constructor(
    @InjectRepository(ConcurrencyEquipment)
    private readonly concurrencyEquipmentRepository: Repository<ConcurrencyEquipment>,
    @InjectRepository(ConcurrencyLimit)
    private readonly concurrencyLimitRepository: Repository<ConcurrencyLimit>,
    private readonly concurrencyCustomService: ConcurrencyCustomService,
  ) {}

  async validateConcurrency(dto: CheckConcurrencyDto): Promise<void> {
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
    const limit = await this.findApplicableLimit(
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
      await this.concurrencyCustomService.countReservationsInGroupByTimeRange({
        concurrencyId: group.concurrencyId,
        subscriptionDetailId: dto.subscriptionDetailId,
        reservationDate: dto.reservationDate,
        initialHour: dto.initialHour,
        finalHour: dto.finalHour,
      });
    // PASO 4: ¿Excede el límite?
    if (currentReservations >= limit.maxReservations)
      throw new RpcException({
        status: HttpStatus.CONFLICT,
        message: `Límite de concurrencia alcanzado para el grupo "${group.groupName}". Límite máximo: ${limit.maxReservations}, reservas actuales: ${currentReservations}`,
      });
    // ✅ Está dentro del límite, permitir
    return;
  }

  private async findApplicableLimit(
    concurrencyId: string,
    reservationDate: string,
    initialHour: string,
    finalHour: string,
  ): Promise<ConcurrencyLimit | null> {
    const dateObj = new Date(reservationDate);
    // Buscar límites activos para este grupo
    const limits = await this.concurrencyLimitRepository.find({
      where: {
        concurrency: { concurrencyId },
        isActive: true,
      },
      relations: ['concurrencyTimeSlot'],
    });
    if (limits.length === 0) return null;
    // Filtrar por vigencia de fecha
    const validLimits = limits.filter((limit) => {
      const effectiveFrom = new Date(limit.effectiveFrom);
      const effectiveTo = limit.effectiveTo
        ? new Date(limit.effectiveTo)
        : null;
      const isAfterStart = dateObj >= effectiveFrom;
      const isBeforeEnd = !effectiveTo || dateObj <= effectiveTo;
      return isAfterStart && isBeforeEnd;
    });
    if (validLimits.length === 0) return null;
    // Buscar límite que aplique al rango horario
    for (const limit of validLimits) {
      // Si no tiene time slot o es general, aplica a cualquier hora
      if (!limit.concurrencyTimeSlot || limit.concurrencyTimeSlot.isGeneral)
        return limit;
      // Si tiene time slot, verificar si el horario cae dentro del turno
      const slotStartTime = limit.concurrencyTimeSlot.startTime;
      const slotEndTime = limit.concurrencyTimeSlot.endTime;
      if (!slotStartTime || !slotEndTime) return limit;
      // Verificar si hay solapamiento entre el turno y el horario de la reserva
      const overlaps = this.checkTimeOverlap(
        initialHour,
        finalHour,
        slotStartTime,
        slotEndTime,
      );
      if (overlaps) return limit;
    }
    return null;
  }

  private checkTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    // Dos rangos de tiempo se solapan si: (start1 < end2) AND (end1 > start2)
    return start1 < end2 && end1 > start2;
  }
}
