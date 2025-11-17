import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { ReservationLaboratoryEquipmentAssignCredentialsService } from '../custom/reservation-laboratory-equipment-assign-credentials.service';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { CreateReservationDetailDto } from 'src/reservation/dto/create-reservation-detail.dto';
import { InformationSubscriberDto } from 'src/reservation/dto/information-subscriber.dto';

@Injectable()
export class ReservationLaboratoryEquipmentCreateService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    @Inject(
      forwardRef(() => ReservationLaboratoryEquipmentAssignCredentialsService),
    )
    private readonly reservationLaboratoryEquipmentAssignCredentialsService: ReservationLaboratoryEquipmentAssignCredentialsService,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
  ) {}

  async execute(
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
      await this.reservationLaboratoryEquipmentAssignCredentialsService.execute(
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
}
