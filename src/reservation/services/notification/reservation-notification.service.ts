import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EmailNotificationMetadataDto } from 'src/communications/grpc/dto/send-lab-equipment-reservation-cancellation-email.dto';
import { FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-laboratory-equipment-by-laboratory-equipment-id';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { ReservationSendConfirmationEmailService } from './reservation-send-confirmation-email.service';
import { ReservationSendCancellationEmailService } from './reservation-send-cancellation-email.service';
import { ReservationSendRemindersService } from './reservation-send-reminders.service';
import {
  CreateReservationResponseDto,
  RequestMetadataDto,
} from 'src/reservation/dto/create-reservation.dto';
import { InformationSubscriberDto } from 'src/reservation/dto/information-subscriber.dto';
import { SendReservationRemindersResponseDto } from 'src/reservation/dto/send-reservation-reminders-response.dto';

@Injectable()
export class ReservationNotificationService {
  constructor(
    private readonly reservationSendConfirmationEmailService: ReservationSendConfirmationEmailService,
    private readonly reservationSendCancellationEmailService: ReservationSendCancellationEmailService,
    @Inject(forwardRef(() => ReservationSendRemindersService))
    private readonly reservationSendRemindersService: ReservationSendRemindersService,
  ) {}

  async sendEmailForConfirmationReservation(
    reservation: CreateReservationResponseDto,
    informationSubscriber: InformationSubscriberDto,
    equipmentMap: Map<
      string,
      FindOneLaboratoryEquipmentByLaboratoryEquipmentIdResponseDto
    >,
    subscriptionDetailId: string,
    user?: SessionUserDataDto,
    requestMetadata?: RequestMetadataDto,
  ): Promise<void> {
    return await this.reservationSendConfirmationEmailService.execute(
      reservation,
      informationSubscriber,
      equipmentMap,
      subscriptionDetailId,
      user,
      requestMetadata,
    );
  }

  async sendCancellationEmail(
    reservationLaboratoryEquipmentId: string,
    metadata: EmailNotificationMetadataDto,
    subscriptionDetailId: string,
    subscriberId?: string,
    user?: SessionUserDataDto,
    requestMetadata?: RequestMetadataDto,
  ): Promise<void> {
    return await this.reservationSendCancellationEmailService.execute(
      reservationLaboratoryEquipmentId,
      metadata,
      subscriptionDetailId,
      subscriberId,
      user,
      requestMetadata,
    );
  }

  async sendReservationReminders(
    currentDateTime: Date,
  ): Promise<SendReservationRemindersResponseDto> {
    return await this.reservationSendRemindersService.execute(currentDateTime);
  }
}
