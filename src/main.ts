import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createValidationExceptionFactory } from './common/factories/create-validation-exception.factory';
import { SERVICE_NAME } from './config/constants';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ServiceExceptionFilter } from './common/filters/service-exception.filter';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.messaging.servers,
        queue: 'main-service-queue',
        reconnect: true,
        maxReconnectAttempts: -1,
        reconnectTimeWait: 2000,
        waitOnFirstConnect: true,
      },
    },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: createValidationExceptionFactory(SERVICE_NAME),
    }),
  );
  app.useGlobalFilters(new ServiceExceptionFilter(SERVICE_NAME));
  app.useGlobalInterceptors(new LoggingInterceptor(SERVICE_NAME));
  await app.listen();
  logger.log(`Microservice is running on port ${envs.server.port}`);
}
bootstrap();
