import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EMAILS_SERVICE } from 'src/config/constants';
import { envs } from 'src/config/envs.config';
import { EmailsClient } from './clients/emails.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EMAILS_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'emails',
          protoPath: join(process.cwd(), 'src/grpc/proto/emails.proto'),
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
    ]),
  ],
  providers: [EmailsClient],
  exports: [EmailsClient],
})
export class GrpcModule {}
