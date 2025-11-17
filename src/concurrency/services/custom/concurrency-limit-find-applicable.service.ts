import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConcurrencyLimit } from '../../entities/concurrency-limit.entity';
import { checkTimeOverlap } from '../../helpers/check-time-overlap.helper';

@Injectable()
export class ConcurrencyLimitFindApplicableService {
  constructor(
    @InjectRepository(ConcurrencyLimit)
    private readonly concurrencyLimitRepository: Repository<ConcurrencyLimit>,
  ) {}

  async execute(
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
      const overlaps = checkTimeOverlap(
        initialHour,
        finalHour,
        slotStartTime,
        slotEndTime,
      );
      if (overlaps) return limit;
    }
    return null;
  }
}
