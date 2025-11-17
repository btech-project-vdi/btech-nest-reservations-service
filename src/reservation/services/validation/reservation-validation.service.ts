import { Injectable } from '@nestjs/common';
import { ReservationLaboratoryEquipment } from 'src/reservation-laboratory-equipment/entities/reservation-laboratory-equipment.entity';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { ReservationValidateDetailService } from './reservation-validate-detail.service';
import { ReservationPrepareAndValidateService } from './reservation-prepare-and-validate.service';
import { ReservationValidateRepeatedService } from './reservation-validate-repeated.service';
import { ReservationValidateHoursDisponibilityService } from './reservation-validate-hours-disponibility.service';
import { ReservationValidateAlertLevelsService } from './reservation-validate-alert-levels.service';
import { CreateReservationDetailDto } from 'src/reservation/dto/create-reservation-detail.dto';
import { ValidateHoursDisponibilityDto } from 'src/reservation/dto/validate-hours-disponibility.dto';
import {
  ValidateRepeatedReservationDto,
  ValidateRepeatedReservationResponseDto,
} from 'src/reservation/dto/validate-repeated-reservation.dto';

@Injectable()
export class ReservationValidationService {
  constructor(
    private readonly reservationValidateDetailService: ReservationValidateDetailService,
    private readonly reservationPrepareAndValidateService: ReservationPrepareAndValidateService,
    private readonly reservationValidateRepeatedService: ReservationValidateRepeatedService,
    private readonly reservationValidateHoursDisponibilityService: ReservationValidateHoursDisponibilityService,
    private readonly reservationValidateAlertLevelsService: ReservationValidateAlertLevelsService,
  ) {}

  async validateReservationDetail(
    detail: CreateReservationDetailDto,
    index: number,
    user: SessionUserDataDto,
    userId: string,
    existingUserReservations: ReservationLaboratoryEquipment[],
    validateHoursCallback: (
      dto: ValidateHoursDisponibilityDto,
      userId: string,
    ) => Promise<any[]>,
  ) {
    return await this.reservationValidateDetailService.execute(
      detail,
      index,
      user,
      userId,
      existingUserReservations,
      validateHoursCallback,
    );
  }

  async prepareAndValidateReservation(
    user: SessionUserDataDto,
    reservationDetails: CreateReservationDetailDto[],
  ): Promise<ReservationLaboratoryEquipment[]> {
    return await this.reservationPrepareAndValidateService.execute(
      user,
      reservationDetails,
    );
  }

  async validateRepeatedReservation(
    validateDto: ValidateRepeatedReservationDto,
  ): Promise<{
    validReservations: ValidateRepeatedReservationResponseDto[];
    invalidReservations: ValidateRepeatedReservationResponseDto[];
  }> {
    return await this.reservationValidateRepeatedService.execute(validateDto);
  }

  async validateHoursDisponibility(
    validateHoursDisponibilityDto: ValidateHoursDisponibilityDto,
    userId: string,
  ) {
    return await this.reservationValidateHoursDisponibilityService.execute(
      validateHoursDisponibilityDto,
      userId,
    );
  }

  async validateAlertLevels(
    subscriberIds: string[],
    levelAlertCode: string,
  ): Promise<
    Map<
      string,
      {
        hasAlertLevel: boolean;
        alertMinutesBefore?: number;
        subscriptionDetailId?: string;
      }
    >
  > {
    return await this.reservationValidateAlertLevelsService.execute(
      subscriberIds,
      levelAlertCode,
    );
  }
}
