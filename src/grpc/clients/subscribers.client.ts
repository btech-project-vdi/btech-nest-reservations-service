import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom, retry, timeout } from 'rxjs';
import { ADMIN_SUBSCRIPTIONS_SERVICE } from 'src/config/constants';
import { SubscribersService } from '../interfaces/subscribers.interface';
import {
  FindSubscribersWithNaturalPersonsDto,
  FindSubscribersWithNaturalPersonsResponseDto,
} from '../dto/find-subscribers-with-natural-persons.dto';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class SubscribersClient implements OnModuleInit {
  private subscribersService: SubscribersService;
  constructor(
    @Inject(ADMIN_SUBSCRIPTIONS_SERVICE)
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.subscribersService =
      this.client.getService<SubscribersService>('SubscribersService');
  }

  async findSubscribersWithNaturalPersons(
    request: FindSubscribersWithNaturalPersonsDto,
  ): Promise<FindSubscribersWithNaturalPersonsResponseDto> {
    return firstValueFrom(
      this.subscribersService
        .findSubscribersWithNaturalPersons(request)
        .pipe(timeout(8000), retry({ count: 2, delay: 1000 })),
    );
  }
}
