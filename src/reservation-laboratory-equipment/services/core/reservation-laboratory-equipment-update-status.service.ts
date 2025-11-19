import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { RpcException } from '@nestjs/microservices';
import { EmailNotificationMetadataDto } from 'src/communications/grpc/dto/send-lab-equipment-reservation-cancellation-email.dto';
import { ReservationNotificationService } from 'src/reservation/services/notification';
import { UpdateReservationStatusDto } from 'src/reservation/dto/update-reservation-status.dto';
import { ResponseBaseMessageDto } from 'src/reservation/dto/response-base-message.dto';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

@Injectable()
export class ReservationLaboratoryEquipmentUpdateStatusService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    @Inject(forwardRef(() => ReservationNotificationService))
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {}

  async execute(
    updateReservationStatusDto: UpdateReservationStatusDto,
  ): Promise<ResponseBaseMessageDto> {
    const {
      reservationLaboratoryEquipmentId,
      status,
      subscriptionDetailId,
      user,
      requestMetadata,
    } = updateReservationStatusDto;

    const reservationLaboratoryEquipment =
      await this.reservationLaboratoryEquipmentRepository.findOne({
        where: { reservationLaboratoryEquipmentId },
        relations: ['reservation'],
      });
    if (!reservationLaboratoryEquipment)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `La reserva no se encuentra registrada`,
      });
    reservationLaboratoryEquipment.status = status;
    reservationLaboratoryEquipment.updatedAt = new Date();
    await this.reservationLaboratoryEquipmentRepository.save(
      reservationLaboratoryEquipment,
    );
    if (status === StatusReservation.CANCELED && subscriptionDetailId)
      this.reservationNotificationService.sendCancellationEmail(
        reservationLaboratoryEquipmentId,
        reservationLaboratoryEquipment.metadata as EmailNotificationMetadataDto,
        subscriptionDetailId,
        reservationLaboratoryEquipment.reservation.reservationId,
        reservationLaboratoryEquipment.reservation?.subscriberId,
        user,
        requestMetadata,
      );
    return {
      message: `El item de reserva con el id ${reservationLaboratoryEquipmentId} fue actualizado con el estado ${status}`,
    };
  }
}
