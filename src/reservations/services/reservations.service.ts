import { Injectable } from '@nestjs/common';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
} from '../dto/create-reservation.dto';
import {
  ValidateRepeatedReservationDto,
  ValidateRepeatedReservationResponseDto,
} from '../dto/validate-repeated-reservation.dto';
import {
  FindAllReservationsDto,
  FindAllReservationsResponseDto,
} from '../dto/find-all-reservations.dto';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { Paginated } from 'src/common/dto/paginated.dto';

// Services
import { ReservationsCoreService } from './reservations-core.service';
import { ReservationsRepeatedService } from './reservations-repeated.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsCoreService: ReservationsCoreService,
    private readonly reservationsRepeatedService: ReservationsRepeatedService,
  ) {}

  async createReservation(
    user: SessionUserDataDto,
    createReservationDto: CreateReservationDto,
  ): Promise<CreateReservationResponseDto> {
    return this.reservationsCoreService.createReservation(
      user,
      createReservationDto,
    );
  }

  async findAll(
    user: SessionUserDataDto,
    findAllReservationsDto: FindAllReservationsDto,
  ): Promise<Paginated<FindAllReservationsResponseDto>> {
    return this.reservationsCoreService.findAll(user, findAllReservationsDto);
  }

  async validateRepeatedReservation(
    validateDto: ValidateRepeatedReservationDto,
  ): Promise<{
    validReservations: ValidateRepeatedReservationResponseDto[];
    invalidReservations: ValidateRepeatedReservationResponseDto[];
  }> {
    return this.reservationsRepeatedService.validateRepeatedReservation(
      validateDto,
    );
  }
}
