import { Injectable } from '@nestjs/common';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { ReservationCreateService } from './reservation-create.service';
import { ReservationFindAllService } from './reservation-find-all.service';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
} from 'src/reservation/dto/create-reservation.dto';
import {
  FindAllReservationsDto,
  FindAllReservationsResponseDto,
} from 'src/reservation/dto/find-all-reservations.dto';
import { PaginationResponseDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReservationCoreService {
  constructor(
    private readonly reservationCreateService: ReservationCreateService,
    private readonly reservationFindAllService: ReservationFindAllService,
  ) {}

  async createReservation(
    user: SessionUserDataDto,
    createReservationDto: CreateReservationDto,
  ): Promise<CreateReservationResponseDto> {
    return await this.reservationCreateService.execute(
      user,
      createReservationDto,
    );
  }

  async findAll(
    user: SessionUserDataDto,
    findAllReservationsDto: FindAllReservationsDto,
  ): Promise<PaginationResponseDto<FindAllReservationsResponseDto>> {
    return await this.reservationFindAllService.execute(
      user,
      findAllReservationsDto,
    );
  }
}
