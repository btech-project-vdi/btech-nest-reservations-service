import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationProcessHistory } from '../../entities/reservation-process-history.entity';
import { Repository } from 'typeorm';
import { StatusResponse } from 'src/reservation-process-history/enums/status-response.enum';

@Injectable()
export class ReservationProcessHistoryCreateService {
  constructor(
    @InjectRepository(ReservationProcessHistory)
    private readonly reservationProcessHistoryRepository: Repository<ReservationProcessHistory>,
  ) {}

  async execute(
    reservationLaboratoryEquipmentId: string,
    message: string,
    status: StatusResponse,
    statusCode: number,
    metadata?: Record<string, string>,
  ): Promise<ReservationProcessHistory> {
    const reservationProcessHistory =
      this.reservationProcessHistoryRepository.create({
        reservationLaboratoryEquipe: {
          reservationLaboratoryEquipmentId,
        },
        message,
        status,
        statusCode,
        metadata: metadata || {},
      });
    return await this.reservationProcessHistoryRepository.save(
      reservationProcessHistory,
    );
  }
}
