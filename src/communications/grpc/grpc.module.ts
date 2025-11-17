import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  ADMIN_SUBSCRIPTIONS_SERVICE,
  EMAILS_SERVICE,
} from 'src/config/constants';
import { envs } from 'src/config/envs.config';
import { EmailsClient } from './clients/emails.client';
import { SubscribersClient } from './clients/subscribers.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EMAILS_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'emails',
          protoPath: join(
            process.cwd(),
            'src/communications/grpc/proto/emails.proto',
          ),
          url: envs.grpc.emailsUrl,
          keepalive: {
            keepaliveTimeMs: 30000, // Ping cada 30 segundos
            keepaliveTimeoutMs: 5000, // Timeout del ping: 5 segundos
            keepalivePermitWithoutCalls: 1, // ← NÚMERO, no boolean
          },
          loader: {
            keepCase: true,
            defaults: true,
          },
        },
      },
      {
        name: ADMIN_SUBSCRIPTIONS_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'subscribers',
          protoPath: join(
            process.cwd(),
            'src/communications/grpc/proto/subscribers.proto',
          ),
          url: envs.grpc.subscribersUrl,
          keepalive: {
            keepaliveTimeMs: 30000,
            keepaliveTimeoutMs: 5000,
            keepalivePermitWithoutCalls: 1,
          },
          loader: {
            keepCase: true,
            defaults: true,
          },
        },
      },
    ]),
  ],
  providers: [EmailsClient, SubscribersClient],
  exports: [EmailsClient, SubscribersClient],
})
export class GrpcModule {}
