import { Module } from '@nestjs/common';
import { GrpcModule } from './grpc/grpc.module';
import { NatsModule } from './nats';

@Module({
  imports: [GrpcModule, NatsModule.register()],
  exports: [GrpcModule, NatsModule],
})
export class CommunicationsModule {}
