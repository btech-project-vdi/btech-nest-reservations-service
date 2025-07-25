/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { catchError, lastValueFrom, retry, timeout } from 'rxjs';
import { EMAILS_SERVICE } from 'src/config/constants';
import { EmailsService } from '../interfaces/emails.interface';
import {
  SendLabReservationEmailDto,
  SendLabReservationEmailResponseDto,
} from '../dto/send-lab-reservation-email.dto';
import { ClientGrpc, RpcException } from '@nestjs/microservices';

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
    return await lastValueFrom(
      this.emailsService.sendLabReservationEmail(request).pipe(
        timeout(8000),
        retry({ count: 2, delay: 1000 }),
        catchError((error) => {
          throw new RpcException(JSON.parse(error.details));
        }),
      ),
    );
  }
}
