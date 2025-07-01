import { Injectable } from '@nestjs/common';
import { ReservationLaboratoryEquipmentService } from 'src/reservations/services/reservation-laboratory-equipment.service';
import { ConfirmListReservationDto } from './dto/confirm-list-reservation.dto';
import { ReservationProcessHistoryService } from 'src/reservations/services/reservation-process-history.service';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { StatusReservation } from 'src/reservations/enums/status-reservation.enum';
import { StatusResponse } from 'src/reservations/enums/status-response.enum';

@Injectable()
export class SystemsService {
  constructor(
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
    private readonly reservationProcessHistoryService: ReservationProcessHistoryService,
  ) {}

  async confirmListReservation(
    confirmListReservationDto: ConfirmListReservationDto,
  ) {
    const { status, ...paginationDto } = confirmListReservationDto;
    return await this.reservationLaboratoryEquipmentService.confirmListReservation(
      paginationDto,
      status,
    );
  }

  async confirmReservation(confirmReservationDto: ConfirmReservationDto) {
    const {
      reservationLaboratoryEquipmentId,
      statusReservation,
      message,
      status,
      statusCode,
      metadata,
    } = confirmReservationDto;
    confirmReservationDto = {
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
    return await this.reservationProcessHistoryService.confirmReservation(
      confirmReservationDto,
    );
  }
}
