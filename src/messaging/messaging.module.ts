import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagingService } from './messaging.service';
import { envs } from 'src/config/envs.config';
import { MESSAGING_SERVICE } from 'src/config/constants';

@Global()
@Module({
  exports: [],
  providers: [],
})
export class MessagingModule {
  static register(): DynamicModule {
    return {
      module: MessagingModule,
      imports: [
        ClientsModule.register([
          {
            name: MESSAGING_SERVICE,
            transport: Transport.NATS,
            options: {
              servers: envs.messaging.servers,
              queue: 'admin-laboratories-service-queue',
              reconnect: true,
              maxReconnectAttempts: -1,
              reconnectTimeWait: 2000,
              waitOnFirstConnect: true,
            },
          },
        ]),
      ],
      exports: [MessagingService],
      providers: [MessagingService],
    };
  }
}
