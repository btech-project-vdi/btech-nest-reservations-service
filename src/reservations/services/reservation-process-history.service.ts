import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationProcessHistory } from '../entities/reservation-process-history.entity';
import { Repository } from 'typeorm';
import { ConfirmReservationDto } from 'src/systems/dto/confirm-reservation.dto';
import { ReservationLaboratoryEquipmentService } from './reservation-laboratory-equipment.service';

@Injectable()
export class ReservationProcessHistoryService {
  constructor(
    @InjectRepository(ReservationProcessHistory)
    private readonly reservationProcessHistoryRepository: Repository<ReservationProcessHistory>,
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  async confirmReservation(
    confirmReservationDto: ConfirmReservationDto,
  ): Promise<{ message: string }> {
    const { reservationLaboratoryEquipmentId } = confirmReservationDto;
    await this.reservationLaboratoryEquipmentService.updateStatus({
      reservationLaboratoryEquipmentId,
      status: confirmReservationDto.statusReservation,
    });
    const reservationProcessHistory =
      this.reservationProcessHistoryRepository.create({
        reservationLaboratoryEquipe: {
          reservationLaboratoryEquipmentId,
        },
        message: confirmReservationDto.message,
        status: confirmReservationDto.status,
        statusCode: confirmReservationDto.statusCode,
        metadata: confirmReservationDto.metadata
          ? confirmReservationDto.metadata
          : {},
      });
    await this.reservationProcessHistoryRepository.save(
      reservationProcessHistory,
    );
    return {
      message: 'Reserva confirmada correctamente',
    };
  }
}
