import { Injectable } from '@nestjs/common';
import { ReservationCredentials } from '../../interfaces/reservation-credentials.interface';
import { getConflictingUserIndices } from '../../helpers/get-conflict-user-indices.helper';
import { findAvailableUserIndex } from '../../helpers/find-available-user-index.helper';
import { generateCredentials } from '../../helpers/generate-credentials.helper';
import { ReservationLaboratoryEquipmentFindOverlappingReservationsService } from './reservation-laboratory-equipment-find-overlapping-reservations.service';
import { ReservationLaboratoryEquipmentGetLaboratoryMetadataService } from './reservation-laboratory-equipment-get-laboratory-metadata.service';

@Injectable()
export class ReservationLaboratoryEquipmentAssignCredentialsService {
  constructor(
    private readonly reservationLaboratoryEquipmentFindOverlappingReservationsService: ReservationLaboratoryEquipmentFindOverlappingReservationsService,
    private readonly reservationLaboratoryEquipmentGetLaboratoryMetadataService: ReservationLaboratoryEquipmentGetLaboratoryMetadataService,
  ) {}

  async execute(
    laboratoryEquipmentId: string,
    reservationDate: Date,
    initialHour: string,
    finalHour: string,
  ): Promise<ReservationCredentials> {
    // 1. Obtener las reservas que se superponen EXACTAMENTE con la nueva reserva
    const overlappingReservations =
      await this.reservationLaboratoryEquipmentFindOverlappingReservationsService.execute(
        laboratoryEquipmentId,
        reservationDate,
        initialHour,
        finalHour,
      );
    // 2. Obtener la metadata del laboratorio para las credenciales
    const laboratoryMetadata =
      await this.reservationLaboratoryEquipmentGetLaboratoryMetadataService.execute(
        laboratoryEquipmentId,
      );
    // 3. Determinar qué usuarios están ocupados por reservas que SE SUPERPONEN
    const conflictingUserIndices = getConflictingUserIndices(
      overlappingReservations,
    );
    // 4. Encontrar el primer usuario disponible que NO esté en conflicto
    const availableUserIndex = findAvailableUserIndex(conflictingUserIndices);
    // 5. Generar las credenciales
    return generateCredentials(
      laboratoryMetadata,
      laboratoryEquipmentId,
      availableUserIndex,
      initialHour,
    );
  }
}
