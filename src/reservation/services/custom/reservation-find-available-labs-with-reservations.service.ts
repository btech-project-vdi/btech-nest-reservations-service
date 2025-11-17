import { Injectable } from '@nestjs/common';
import {
  FindAvailableLaboratoriesEquipmentsForUserDto,
  FindAvailableLaboratoriesEquipmentsForUserResponseDto,
} from 'src/common/dto/find-available-laboratories-equipments-for-user.dto';
import { Paginated } from 'src/common/dto/paginated.dto';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { ReservationLaboratoryEquipmentGetEquipmentIdsService } from 'src/reservation-laboratory-equipment/services/custom/reservation-laboratory-equipment-get-equipment-ids.service';
import { formatFindAvailableLaboratoriesForUserResponse } from 'src/reservation/helpers/format-find-available-laboratories-for-user-response.helper';

@Injectable()
export class ReservationFindAvailableLabsWithReservationsService {
  constructor(
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
    private readonly reservationLaboratoryEquipmentGetEquipmentIdsService: ReservationLaboratoryEquipmentGetEquipmentIdsService,
  ) {}

  async execute(
    findAvailableLaboratoriesEquipmentsForUserDto: FindAvailableLaboratoriesEquipmentsForUserDto,
  ): Promise<Paginated<FindAvailableLaboratoriesEquipmentsForUserResponseDto>> {
    const allLaboratories =
      await this.adminLaboratoriesService.findAvailableLaboratoriesEquipmentsForUser(
        findAvailableLaboratoriesEquipmentsForUserDto,
      );
    const laboratoryEquipmentIdsWithReservations =
      await this.reservationLaboratoryEquipmentGetEquipmentIdsService.execute();
    const filteredLaboratories = formatFindAvailableLaboratoriesForUserResponse(
      allLaboratories.data,
      laboratoryEquipmentIdsWithReservations,
    );
    return {
      data: filteredLaboratories,
      total: filteredLaboratories.length,
      page: allLaboratories.page,
      limit: allLaboratories.limit,
      totalPages: Math.ceil(
        filteredLaboratories.length / allLaboratories.limit,
      ),
    };
  }
}
