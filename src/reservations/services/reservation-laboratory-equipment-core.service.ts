import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { InformationSubscriberDto } from '../dto/information-subscriber.dto';
import { ReservationCredentialsService } from './reservation-credentials.service';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { UpdateReservationStatusDto } from '../dto/update-reservation-status.dto';
import { ResponseBaseMessageDto } from '../dto/response-base-message.dto';
import { RpcException } from '@nestjs/microservices';
import { StatusReservation } from '../enums/status-reservation.enum';
import { ReservationsNotificationService } from './reservations-notification.service';
import { EmailNotificationMetadataDto } from 'src/grpc/dto/send-lab-equipment-reservation-cancellation-email.dto';
import { FindOneReservationLaboratoryEquipmentResponseDto } from '../dto/find-one-reservation-laboratory-equipment.dto';
import { formatReservationLaboratoryEquipmentResponse } from '../helpers/format-reservation-laboratory-equipment-response.helper';

@Injectable()
export class ReservationLaboratoryEquipmentCoreService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    private readonly reservationCredentialsService: ReservationCredentialsService,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    @Inject(forwardRef(() => ReservationsNotificationService))
    private readonly reservationsNotificationService: ReservationsNotificationService,
  ) {}

  async create(
    createReservationDetailDto: CreateReservationDetailDto,
    informationSubscriber: InformationSubscriberDto,
    queryRunner?: QueryRunner,
    subscriptionDetailId?: string,
  ): Promise<ReservationLaboratoryEquipment> {
    const [year, month, day] = createReservationDetailDto.initialDate
      .split('-')
      .map(Number);
    const [finalYear, finalMonth, finalDay] =
      createReservationDetailDto.finalDate.split('-').map(Number);
    const reservationDate = new Date(year, month - 1, day);

    // Generar credenciales automáticamente basándose en conflictos
    const credentials =
      await this.reservationCredentialsService.assignUserCredentials(
        createReservationDetailDto.laboratoryEquipmentId,
        reservationDate,
        createReservationDetailDto.initialHour,
        createReservationDetailDto.finalHour,
      );

    // Obtener información del laboratorio y equipo para la metadata de notificación
    const equipment =
      await this.adminLaboratoriesService.findOneByLaboratoryEquipmentId(
        createReservationDetailDto.laboratoryEquipmentId,
      );

    // Crear metadata completa con credenciales e información de notificación
    const completeMetadata = {
      // Credenciales de acceso
      ...credentials,
      // Información para notificaciones por correo
      emailNotificationData: {
        // Información del suscriptor
        subscriberEmail: informationSubscriber.email,
        subscriberName: informationSubscriber.subscriberName,
        companyName: informationSubscriber.companyName,
        logoUrl: informationSubscriber.logoUrl,
        primaryColor: informationSubscriber.primaryColor,
        // Información del laboratorio y equipo
        laboratoryName: equipment?.description || 'Laboratorio',
        // Información de la reserva
        reservationDate: reservationDate.toLocaleDateString('es-PE'),
        initialHour: createReservationDetailDto.initialHour,
        finalHour: createReservationDetailDto.finalHour,
      },
    };
    const repository = queryRunner
      ? queryRunner.manager.getRepository(ReservationLaboratoryEquipment)
      : this.reservationLaboratoryEquipmentRepository;
    const reservationDetail = repository.create({
      metadata: completeMetadata,
      laboratoryEquipmentId: createReservationDetailDto.laboratoryEquipmentId,
      subscriptionDetailId: subscriptionDetailId,
      reservationDate: reservationDate,
      initialHour: createReservationDetailDto.initialHour,
      reservationFinalDate: new Date(finalYear, finalMonth - 1, finalDay),
      finalHour: createReservationDetailDto.finalHour,
    });
    return await repository.save(reservationDetail);
  }

  async updateStatus(
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
      this.reservationsNotificationService.sendCancellationEmail(
        reservationLaboratoryEquipmentId,
        reservationLaboratoryEquipment.metadata as EmailNotificationMetadataDto,
        subscriptionDetailId,
        reservationLaboratoryEquipment.reservation?.subscriberId,
        user,
        requestMetadata,
      );
    return {
      message: `El item de reserva con el id ${reservationLaboratoryEquipmentId} fue actualizado con el estado ${status}`,
    };
  }

  async findOne(
    reservationLaboratoryEquipmentId: string,
  ): Promise<FindOneReservationLaboratoryEquipmentResponseDto> {
    const reservationLaboratoryEquipment =
      await this.reservationLaboratoryEquipmentRepository.findOne({
        where: { reservationLaboratoryEquipmentId },
      });
    if (!reservationLaboratoryEquipment)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `El item de reserva con el id ${reservationLaboratoryEquipmentId} no se encuentra registrado`,
      });
    return formatReservationLaboratoryEquipmentResponse(
      reservationLaboratoryEquipment,
    );
  }
}
