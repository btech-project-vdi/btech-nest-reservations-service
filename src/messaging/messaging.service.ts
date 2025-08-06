import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MESSAGING_SERVICE } from 'src/config/constants';

@Injectable()
export class MessagingService {
  constructor(
    @Inject(MESSAGING_SERVICE) private readonly client: ClientProxy,
  ) {}
  async send<T>(pattern: string | { cmd: string }, data: any): Promise<T> {
    return firstValueFrom(this.client.send<T>(pattern, data));
  }

  emit<T>(pattern: string, data: any): void {
    this.client.emit<T>(pattern, data);
  }
}
