import { Injectable } from '@nestjs/common';
import { FindSubscribersWithNaturalPersonsResponseDto } from 'src/communications/grpc/dto/find-subscribers-with-natural-persons.dto';
import { ReservationFindAdminReservationsService } from './reservation-find-admin-reservations.service';
import { ReservationFindSubscribersListService } from './reservation-find-subscribers-list.service';
import {
  FindAdminReservationsDto,
  FindAdminReservationsResponseDto,
} from 'src/reservation/dto/find-admin-reservations.dto';
import { FindSubscribersListDto } from 'src/reservation/dto/find-subscribers-list.dto';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { ReservationFindEquipmentMapService } from './reservation-find-equipment-map.service';
import { PaginationResponseDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReservationCustomService {
  constructor(
    private readonly reservationFindAdminReservationsService: ReservationFindAdminReservationsService,
    private readonly reservationFindSubscribersListService: ReservationFindSubscribersListService,
    private readonly reservationFindEquipmentMapService: ReservationFindEquipmentMapService,
  ) {}

  async findAdminReservations(
    findAdminReservationsDto: FindAdminReservationsDto,
  ): Promise<PaginationResponseDto<FindAdminReservationsResponseDto>> {
    return await this.reservationFindAdminReservationsService.execute(
      findAdminReservationsDto,
    );
  }

  async findSubscribersList(
    findSubscribersListDto: FindSubscribersListDto,
  ): Promise<FindSubscribersWithNaturalPersonsResponseDto> {
    return await this.reservationFindSubscribersListService.execute(
      findSubscribersListDto,
    );
  }

  async findEquipmentMapData(
    laboratoryEquipmentIds: string[],
  ): Promise<
    Map<string, FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto>
  > {
    return await this.reservationFindEquipmentMapService.execute(
      laboratoryEquipmentIds,
    );
  }
}
