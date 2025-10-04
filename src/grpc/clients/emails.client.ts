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
  ): Promise<SendLabReservationEmailResponseDto> {
    return firstValueFrom(
      this.emailsService
        .sendLabReservationEmail(request)
        .pipe(timeout(8000), retry({ count: 2, delay: 1000 })),
    );
  }

  async sendLabReservationReminderEmail(
    request: SendLabReservationReminderEmailDto,
  ): Promise<SendLabReservationEmailResponseDto> {
    return firstValueFrom(
      this.emailsService
        .sendLabReservationReminderEmail(request)
        .pipe(timeout(8000), retry({ count: 2, delay: 1000 })),
    );
  }

  async sendLabEquipmentReservationCancellationEmail(
    request: SendLabEquipmentReservationCancellationEmailDto,
  ): Promise<SendLabEquipmentReservationCancellationEmailResponseDto> {
    return firstValueFrom(
      this.emailsService
        .sendLabEquipmentReservationCancellationEmail(request)
        .pipe(timeout(8000), retry({ count: 2, delay: 1000 })),
    );
  }
}
