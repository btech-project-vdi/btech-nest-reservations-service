/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { StatusReservation } from '../enums/status-reservation.enum';
import { AdminLaboratoriesService } from '../../common/services/admin-laboratories.service';
import { RpcException } from '@nestjs/microservices';
import { ReservationCredentials } from '../interfaces/reservation-credentials.interface';
import { getConflictingUserIndices } from '../helpers/get-conflict-user-indices.helper';
import { findAvailableUserIndex } from '../helpers/find-available-user-index.helper';

@Injectable()
export class ReservationCredentialsService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
  ) {}

  async assignUserCredentials(
    laboratoryEquipmentId: string,
    reservationDate: Date,
    initialHour: string,
    finalHour: string,
  ): Promise<ReservationCredentials> {
    // 1. Obtener las reservas que se superponen EXACTAMENTE con la nueva reserva
    const overlappingReservations = await this.findOverlappingReservations(
      laboratoryEquipmentId,
      reservationDate,
      initialHour,
      finalHour,
    );
    // 2. Obtener la metadata del laboratorio para las credenciales
    const laboratoryMetadata = await this.getLaboratoryMetadata(
      laboratoryEquipmentId,
    );
    // 3. Determinar qué usuarios están ocupados por reservas que SE SUPERPONEN
    const conflictingUserIndices = getConflictingUserIndices(
      overlappingReservations,
    );
    // 4. Encontrar el primer usuario disponible que NO esté en conflicto
    const availableUserIndex = findAvailableUserIndex(conflictingUserIndices);
    // 5. Generar las credenciales
    return this.generateCredentials(
      laboratoryMetadata,
      laboratoryEquipmentId,
      availableUserIndex,
    );
  }

  /**
   * Encuentra reservas que se superponen EXACTAMENTE con la nueva reserva
   * Usa la misma lógica que checkAvailabilityBatch
   */
  private async findOverlappingReservations(
    laboratoryEquipmentId: string,
    reservationDate: Date,
    initialHour: string,
    finalHour: string,
  ): Promise<ReservationLaboratoryEquipment[]> {
    const date = reservationDate.toISOString().split('T')[0];
    // Usar exactamente la misma lógica que checkAvailabilityBatch
    const newReservationStartDateTime = `${date} ${initialHour}`;
    let newReservationEndDateTime: string;
    const initialMinutes =
      parseInt(initialHour.split(':')[0]) * 60 +
      parseInt(initialHour.split(':')[1]);
    const finalMinutes =
      parseInt(finalHour.split(':')[0]) * 60 +
      parseInt(finalHour.split(':')[1]);
    if (finalMinutes <= initialMinutes) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayFormatted = nextDay.toISOString().split('T')[0];
      newReservationEndDateTime = `${nextDayFormatted} ${finalHour}`;
    } else {
      newReservationEndDateTime = `${date} ${finalHour}`;
    }
    return await this.reservationLaboratoryEquipmentRepository
      .createQueryBuilder('rle')
      .where('rle.laboratoryEquipmentId = :laboratoryEquipmentId', {
        laboratoryEquipmentId,
      })
      .andWhere('rle.status IN (:...statuses)', {
        statuses: [StatusReservation.PENDING, StatusReservation.CONFIRMED],
      })
      .andWhere(
        // Exactamente la misma lógica de superposición que checkAvailabilityBatch
        `:newResStart < CAST(CASE
          WHEN rle.reservationFinalDate IS NOT NULL AND rle.reservationFinalDate > rle.reservationDate
          THEN CONCAT(rle.reservationFinalDate, ' ', rle.finalHour)
          ELSE CONCAT(rle.reservationDate, ' ', rle.finalHour)
        END AS DATETIME) AND :newResEnd > CAST(CONCAT(rle.reservationDate, ' ', rle.initialHour) AS DATETIME)`,
        {
          newResStart: newReservationStartDateTime,
          newResEnd: newReservationEndDateTime,
        },
      )
      .getMany();
  }

  /**
   * Obtiene la metadata del laboratorio basándose en el ID del equipo
   */
  private async getLaboratoryMetadata(
    laboratoryEquipmentId: string,
  ): Promise<Record<string, any>> {
    const equipment =
      await this.adminLaboratoriesService.findOneByLaboratoryEquipmentId(
        laboratoryEquipmentId,
      );
    if (!equipment?.metadata)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `No se encontró metadata para el laboratorio del equipo ${laboratoryEquipmentId}`,
      });
    return equipment.metadata;
  }

  /**
   * Genera las credenciales basándose en la metadata del laboratorio
   */
  private generateCredentials(
    laboratoryMetadata: Record<string, any>,
    laboratoryEquipmentId: string,
    userIndex: number,
  ): ReservationCredentials {
    // Determinar el nombre del equipo basándose en el índice
    const equipmentKeys = Object.keys(laboratoryMetadata);
    const equipmentPattern =
      equipmentKeys.find((key) => key.includes('-DOC')) || '';
    const labPrefix = equipmentPattern.replace('-DOC', '');

    let equipmentName: string;
    if (userIndex === 0) {
      equipmentName = `${labPrefix}-DOC`;
    } else {
      equipmentName = `${labPrefix}-${userIndex.toString().padStart(2, '0')}`;
    }
    // Obtener las credenciales de la metadata del laboratorio
    const equipmentCredentials = laboratoryMetadata[equipmentName];
    if (!equipmentCredentials)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `No se encontraron credenciales para el equipo ${equipmentName}`,
      });
    // Las credenciales están en formato { morning1, morning2, afternoon, night }
    // Siempre usar las credenciales nocturnas como se especificó
    const nightCredentials = equipmentCredentials.night as string;
    return {
      accessUrl: 'https://vdi.btech.edu.pe', // URL base del VDI
      username: equipmentName,
      password: nightCredentials,
    };
  }
}
