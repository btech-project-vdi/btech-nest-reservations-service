import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom, retry, timeout } from 'rxjs';
import { EMAILS_SERVICE } from 'src/config/constants';
import { EmailsService } from '../interfaces/emails.interface';
import {
  SendLabReservationEmailDto,
  SendLabReservationEmailResponseDto,
} from '../dto/send-lab-reservation-email.dto';
import { SendLabReservationReminderEmailDto } from '../dto/send-lab-reservation-reminder-email.dto';
import {
  SendLabEquipmentReservationCancellationEmailDto,
  SendLabEquipmentReservationCancellationEmailResponseDto,
} from '../dto/send-lab-equipment-reservation-cancellation-email.dto';
import { ClientGrpc } from '@nestjs/microservices';

export interface GrpcCallMetadata {
  ipAddress?: string;
  userAgent?: string;
  subscriberId?: string;
}

@Injectable()
export class EmailsClient implements OnModuleInit {
  private emailsService: EmailsService;
  constructor(
    @Inject(EMAILS_SERVICE)
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.emailsService = this.client.getService<EmailsService>('EmailsService');
  }

  async sendLabReservationEmail(
    request: SendLabReservationEmailDto,
    callMetadata?: GrpcCallMetadata,
  ): Promise<SendLabReservationEmailResponseDto> {
    const enrichedRequest = {
      ...request,
      grpcMetadata: callMetadata
        ? {
            ipAddress: callMetadata.ipAddress,
            userAgent: callMetadata.userAgent,
            subscriberId: callMetadata.subscriberId,
          }
        : undefined,
    };
    return firstValueFrom(
      this.emailsService
        .sendLabReservationEmail(enrichedRequest)
        .pipe(timeout(8000), retry({ count: 2, delay: 1000 })),
    );
  }

  async sendLabReservationReminderEmail(
    request: SendLabReservationReminderEmailDto,
    callMetadata?: GrpcCallMetadata,
  ): Promise<SendLabReservationEmailResponseDto> {
    const enrichedRequest = {
      ...request,
      grpcMetadata: callMetadata
        ? {
            ipAddress: callMetadata.ipAddress,
            userAgent: callMetadata.userAgent,
            subscriberId: callMetadata.subscriberId,
          }
        : undefined,
    };
    return firstValueFrom(
      this.emailsService
        .sendLabReservationReminderEmail(enrichedRequest)
        .pipe(timeout(8000), retry({ count: 2, delay: 1000 })),
    );
  }

  async sendLabEquipmentReservationCancellationEmail(
    request: SendLabEquipmentReservationCancellationEmailDto,
    callMetadata?: GrpcCallMetadata,
  ): Promise<SendLabEquipmentReservationCancellationEmailResponseDto> {
    const enrichedRequest = {
      ...request,
      grpcMetadata: callMetadata
        ? {
            ipAddress: callMetadata.ipAddress,
            userAgent: callMetadata.userAgent,
            subscriberId: callMetadata.subscriberId,
          }
        : undefined,
    };
    return firstValueFrom(
      this.emailsService
        .sendLabEquipmentReservationCancellationEmail(enrichedRequest)
        .pipe(timeout(8000), retry({ count: 2, delay: 1000 })),
    );
  }
}
