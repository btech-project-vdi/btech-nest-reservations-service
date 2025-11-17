import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/constants';
import { NatsService } from './nats.service';
import { envs } from 'src/config/envs.config';

@Global()
@Module({
  exports: [],
  providers: [],
})
export class NatsModule {
  static register(): DynamicModule {
    return {
      module: NatsModule,
      imports: [
        ClientsModule.register([
          {
            name: NATS_SERVICE,
            transport: Transport.NATS,
            options: {
              servers: envs.messaging.servers,
              queue: 'auth-service-queue',
              reconnect: true,
              maxReconnectAttempts: -1,
              reconnectTimeWait: 2000,
              waitOnFirstConnect: true,
            },
          },
        ]),
      ],
      exports: [NatsService],
      providers: [NatsService],
    };
  }
}
