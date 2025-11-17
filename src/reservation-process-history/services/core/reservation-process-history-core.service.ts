import { Injectable } from '@nestjs/common';
import { ReservationProcessHistoryCreateService } from './reservation-process-history-create.service';
import { ReservationProcessHistory } from '../../entities/reservation-process-history.entity';
import { StatusResponse } from 'src/reservation-process-history/enums/status-response.enum';

@Injectable()
export class ReservationProcessHistoryCoreService {
  constructor(
    private readonly reservationProcessHistoryCreateService: ReservationProcessHistoryCreateService,
  ) {}

  async create(
    reservationLaboratoryEquipmentId: string,
    message: string,
    status: StatusResponse,
    statusCode: number,
    metadata?: Record<string, string>,
  ): Promise<ReservationProcessHistory> {
    return await this.reservationProcessHistoryCreateService.execute(
      reservationLaboratoryEquipmentId,
      message,
      status,
      statusCode,
      metadata,
    );
  }
}
