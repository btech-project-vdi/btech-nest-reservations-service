import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusReservation } from '../enums/status-reservation.enum';
import { ConfirmListReservationResponseDto } from 'src/systems/dto/confirm-list-reservation.dto';
import { formatConfirmListReservationResponse } from '../helpers/format-confirm-list-reservation-response.helper';
import { paginate } from 'src/common/helpers/paginate.helper';
import { Paginated } from 'src/common/dto/paginated.dto';
import { CompleteFinishedReservationsResponseDto } from '../dto/complete-finished-reservations.dto';
import { ReservationsCoreService } from './reservations-core.service';
import { getCurrentDateInTimezone } from 'src/schedulers/helpers/timezone.helper';
import { SubscribersClient } from 'src/grpc/clients/subscribers.client';

@Injectable()
export class ReservationLaboratoryEquipmentCustomService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    @Inject(forwardRef(() => ReservationsCoreService))
    private readonly reservationCoreService: ReservationsCoreService,
    private readonly subscribersClient: SubscribersClient,
  ) {}

  async confirmListReservation(
    paginationDto: PaginationDto,
    status: StatusReservation | undefined,
  ): Promise<Paginated<ConfirmListReservationResponseDto>> {
    const whereCondition = status ? { status: status } : {};
    const reservationLaboratoryEquipment =
      await this.reservationLaboratoryEquipmentRepository.find({
        relations: ['reservation'],
        order: {
          createdAt: 'ASC',
        },
        where: whereCondition,
      });
    const laboratoryEquipmentIds = reservationLaboratoryEquipment.map(
      (rle) => rle.laboratoryEquipmentId,
    );
    const equipmentMap = await this.reservationCoreService.findEquipmentMapData(
      laboratoryEquipmentIds,
    );
    const confirmListReservations = formatConfirmListReservationResponse(
      reservationLaboratoryEquipment,
      equipmentMap,
    );
    return await paginate(confirmListReservations, paginationDto);
  }

  async findReservationsForReminder(): Promise<
    ReservationLaboratoryEquipment[]
  > {
    const now = getCurrentDateInTimezone('America/Lima');
    const lookbackMinutes = 10;
    const lookaheadHours = 24;

    const startDate = new Date(now.getTime() - lookbackMinutes * 60000);
    const endDate = new Date(now.getTime() + lookaheadHours * 3600000);

    return await this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .leftJoinAndSelect('rle.reservation', 'reservation')
      .where('rle.reservationDate >= :startDate', {
        startDate: startDate.toISOString().split('T')[0],
      })
      .andWhere('rle.reservationDate <= :endDate', {
        endDate: endDate.toISOString().split('T')[0],
      })
      .andWhere('rle.status = :status', { status: StatusReservation.PENDING })
      .getMany();
  }

  async completeFinishedReservations(
    currentDateTime: Date,
  ): Promise<CompleteFinishedReservationsResponseDto> {
    const finishedReservations =
      await this.reservationLaboratoryEquipmentRepository
        .createQueryBuilder('rle')
        .where('rle.status = :status', {
          status: StatusReservation.PENDING,
        })
        .andWhere(
          `(
          (rle.reservationFinalDate IS NULL AND
            CONCAT(rle.reservationDate, ' ', rle.finalHour) < :currentTime)
          OR
          (rle.reservationFinalDate IS NOT NULL AND
            CONCAT(rle.reservationFinalDate, ' ', rle.finalHour) < :currentTime)
        )`,
          {
            currentTime: currentDateTime
              .toISOString()
              .slice(0, 19)
              .replace('T', ' '),
          },
        )
        .getMany();

    await this.reservationLaboratoryEquipmentRepository.update(
      {
        reservationLaboratoryEquipmentId: In(
          finishedReservations.map((fr) => fr.reservationLaboratoryEquipmentId),
        ),
      },
      { status: StatusReservation.COMPLETED },
    );
    return {
      completedCount: finishedReservations.length,
      executedAt: currentDateTime,
      message: `Se completaron ${finishedReservations.length} reservas que habían terminado su tiempo programado`,
    };
  }

  async getLaboratoryEquipmentIdsWithReservations(): Promise<string[]> {
    const reservations: ReservationLaboratoryEquipment[] =
      await this.reservationLaboratoryEquipmentRepository
        .createQueryBuilder('rle')
        .select('DISTINCT(rle.laboratoryEquipmentId)', 'laboratoryEquipmentId')
        .getRawMany();

    return reservations.map((r) => r.laboratoryEquipmentId);
  }

  async getSubscriberMetadataForReservation(
    subscriberId: string,
    username: string,
  ): Promise<Record<string, any>> {
    try {
      // Obtener información del perfil del suscriptor desde gRPC
      const userProfile = await this.subscribersClient.findUserProfile({
        subscriberId,
        service: 'VDI',
      });
      // Verificar si se encontró información del usuario
      if (!userProfile || !userProfile.naturalPerson)
        // Si no se encuentra información, devolver metadata básica
        return {
          'Codigo de usuario': username,
          'Fecha de creación': new Date().toISOString(),
        };
      const naturalPerson = userProfile.naturalPerson;
      // Formatear la metadata según la estructura requerida
      const metadata = {
        naturalPerson: {
          fullName: naturalPerson.fullName,
          documentType: naturalPerson.documentType,
          documentNumber: naturalPerson.documentNumber,
          maternalSurname: naturalPerson.maternalSurname,
          naturalPersonId: naturalPerson.naturalPersonId,
          paternalSurname: naturalPerson.paternalSurname,
          personInformation: naturalPerson.personInformation.map((info) => ({
            description: info.description,
            informationType: info.informationType,
          })),
        },
        'Codigo de usuario': username,
        'Fecha de creación': new Date().toISOString(),
      };
      return metadata;
    } catch (error) {
      // En caso de error con el servicio gRPC, devolver metadata básica
      console.error(
        'Error al obtener metadata del suscriptor desde gRPC:',
        error,
      );
      return {
        'Codigo de usuario': username,
        'Fecha de creación': new Date().toISOString(),
      };
    }
  }

  async getSubscriberProfileForGrpcMetadata(
    subscriberId: string,
  ): Promise<Record<string, any> | undefined> {
    try {
      const userProfile = await this.subscribersClient.findUserProfile({
        subscriberId,
        service: 'VDI',
      });
      return userProfile ? (userProfile as Record<string, any>) : undefined;
    } catch (error) {
      console.error(
        'Error al obtener perfil del suscriptor desde gRPC:',
        error,
      );
      return undefined;
    }
  }
}
