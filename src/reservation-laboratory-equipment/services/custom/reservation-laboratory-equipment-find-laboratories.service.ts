import { Injectable } from '@nestjs/common';
import {
  FindLaboratoriesWithReservationsDto,
  FindLaboratoriesWithReservationsResponseDto,
} from '../../dto/find-laboratories-with-reservations.dto';
import { ReservationLaboratoryEquipmentGetReservationCountsService } from './reservation-laboratory-equipment-get-reservation-counts.service';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';
import { PaginationResponseDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReservationLaboratoryEquipmentFindLaboratoriesWithReservationsService {
  constructor(
    private readonly reservationLaboratoryEquipmentGetReservationCountsService: ReservationLaboratoryEquipmentGetReservationCountsService,
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
  ) {}

  async execute(
    findLaboratoriesWithReservationsDto: FindLaboratoriesWithReservationsDto,
  ): Promise<
    PaginationResponseDto<FindLaboratoriesWithReservationsResponseDto>
  > {
    const {
      subscriptionDetailId,
      searchTerm,
      isActive,
      timePeriod,
      dateFilterType,
      startDate,
      endDate,
      startTime,
      endTime,
      page,
      limit,
    } = findLaboratoriesWithReservationsDto;
    // 1. Obtener conteo de reservas por equipo con filtros de fecha
    const reservationCountsMap =
      await this.reservationLaboratoryEquipmentGetReservationCountsService.execute(
        timePeriod,
        dateFilterType,
        startDate,
        endDate,
        startTime,
        endTime,
      );
    // 2. Obtener los laboratoryEquipmentIds del Map
    const equipmentIds = Array.from(reservationCountsMap.keys());
    // 3. Llamar al microservicio de laboratorios con los filtros
    const laboratoriesResponse =
      await this.adminLaboratoriesService.findLaboratoriesWithReservationsFilters(
        {
          subscriptionDetailId,
          searchTerm,
          isActive,
          laboratoryEquipmentIds: equipmentIds,
          page,
          limit,
        },
      );
    // 4. Combinar la data con el conteo de reservas
    const dataWithCounts = laboratoriesResponse.data.map((lab) => ({
      ...lab,
      reservationCount:
        reservationCountsMap.get(lab.laboratoryEquipmentId) || 0,
    }));
    return {
      data: dataWithCounts,
      total: laboratoriesResponse.total,
      page: laboratoriesResponse.page,
      limit: laboratoriesResponse.limit,
      totalPages: laboratoriesResponse.totalPages,
    };
  }
}
