import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfirmReservationDto } from 'src/reservation-process-history/dto/confirm-reservation.dto';
import { ReservationProcessHistoryCoreService } from '../core/reservation-process-history-core.service';
import { ReservationLaboratoryEquipmentCoreService } from 'src/reservation-laboratory-equipment/services/core';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';
import { StatusResponse } from 'src/reservation-process-history/enums/status-response.enum';

@Injectable()
export class ReservationProcessHistoryConfirmReservationService {
  constructor(
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCoreService))
    private readonly reservationLaboratoryEquipmentCoreService: ReservationLaboratoryEquipmentCoreService,
    private readonly reservationProcessHistoryCoreService: ReservationProcessHistoryCoreService,
  ) {}

  async execute(
    confirmReservationDto: ConfirmReservationDto,
  ): Promise<{ message: string }> {
    const {
      reservationLaboratoryEquipmentId,
      statusReservation,
      message,
      status,
      statusCode,
      metadata,
    } = confirmReservationDto;

    const confirmedDto: ConfirmReservationDto = {
      reservationLaboratoryEquipmentId,
      statusReservation: statusReservation ?? StatusReservation.CONFIRMED,
      message: message ?? 'Reserva confirmada correctamente',
      status: status ?? StatusResponse.SUCCESS,
      statusCode: statusCode ?? 200,
      metadata: metadata ?? {
        Acción: 'Confirmar Reserva',
        'Fecha de ejecución': new Date().toISOString(),
      },
    };

    await this.reservationLaboratoryEquipmentCoreService.updateStatus({
      reservationLaboratoryEquipmentId,
      status: confirmedDto.statusReservation,
    });
    await this.reservationProcessHistoryCoreService.create(
      reservationLaboratoryEquipmentId,
      confirmedDto.message,
      confirmedDto.status,
      confirmedDto.statusCode,
      confirmedDto.metadata,
    );
    return {
      message: 'Reserva confirmada correctamente',
    };
  }
}
