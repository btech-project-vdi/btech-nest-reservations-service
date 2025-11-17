import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Reservation } from '../../entities/reservation.entity';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { TransactionService } from 'src/common/services/transaction.service';
import { ReservationLaboratoryEquipmentCoreService } from 'src/reservation-laboratory-equipment/services/core/reservation-laboratory-equipment-core.service';
import { ReservationLaboratoryEquipmentCustomService } from 'src/reservation-laboratory-equipment/services/custom/reservation-laboratory-equipment-custom.service';
import { ReservationValidationService } from '../validation/reservation-validation.service';
import { ReservationValidateHoursDisponibilityService } from '../validation/reservation-validate-hours-disponibility.service';
import { ReservationNotificationService } from '../notification/reservation-notification.service';
import { formatReservationResponse } from '../../helpers/format-reservation-response.helper';
import { ReservationFindEquipmentMapService } from '../custom';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
} from 'src/reservation/dto/create-reservation.dto';

@Injectable()
export class ReservationCreateService {
  constructor(
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCoreService))
    private readonly reservationLaboratoryEquipmentCoreService: ReservationLaboratoryEquipmentCoreService,
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCustomService))
    private readonly reservationLaboratoryEquipmentCustomService: ReservationLaboratoryEquipmentCustomService,
    private readonly reservationValidationService: ReservationValidationService,
    private readonly reservationValidateHoursDisponibilityService: ReservationValidateHoursDisponibilityService,
    @Inject(forwardRef(() => ReservationNotificationService))
    private readonly reservationNotificationService: ReservationNotificationService,
    private readonly transactionService: TransactionService,
    private readonly reservationFindEquipmentMapService: ReservationFindEquipmentMapService,
  ) {}

  async execute(
    user: SessionUserDataDto,
    createReservationDto: CreateReservationDto,
  ): Promise<CreateReservationResponseDto> {
    const {
      metadata,
      reservationDetails,
      informationSubscriber,
      requestMetadata,
    } = createReservationDto;
    const existingUserReservations =
      await this.reservationValidationService.prepareAndValidateReservation(
        user,
        reservationDetails,
      );
    return await this.transactionService.runInTransaction(
      async (queryRunner) => {
        await Promise.all(
          reservationDetails.map(async (detail, index) =>
            this.reservationValidationService.validateReservationDetail(
              detail,
              index,
              user,
              user.subscriberId,
              existingUserReservations,
              this.reservationValidateHoursDisponibilityService.execute.bind(
                this.reservationValidateHoursDisponibilityService,
              ),
            ),
          ),
        );
        // Obtener metadata del suscriptor desde gRPC si no se proporciona metadata personalizada
        const reservationMetadata =
          metadata ??
          (await this.reservationLaboratoryEquipmentCustomService.getSubscriberMetadataForReservation(
            user.subscriberId,
            user.username,
          ));

        const reservation = queryRunner.manager.create(Reservation, {
          subscriberId: user.subscriberId,
          subscriptionDetailId: user.subscription?.subscriptionDetailId,
          username: user.username,
          metadata: reservationMetadata,
          reservationLaboratoryEquipment: await Promise.all(
            reservationDetails.map((detail) =>
              this.reservationLaboratoryEquipmentCoreService.create(
                detail,
                informationSubscriber,
                queryRunner,
                user.subscription?.subscriptionDetailId,
              ),
            ),
          ),
        });
        const reservationSaved = await queryRunner.manager.save(reservation);
        const reservationFormatted =
          formatReservationResponse(reservationSaved);
        const laboratoryEquipmentIds =
          reservationFormatted.reservationLaboratoryEquipment.map(
            (rle) => rle.laboratoryEquipmentId,
          );
        const equipmentMap =
          await this.reservationFindEquipmentMapService.execute(
            laboratoryEquipmentIds,
          );
        this.reservationNotificationService.sendEmailForConfirmationReservation(
          reservationFormatted,
          informationSubscriber,
          equipmentMap,
          user.subscription.subscriptionDetailId,
          user,
          requestMetadata,
        );
        return reservationFormatted;
      },
    );
  }
}
