import { Module } from '@nestjs/common';
import { ReservationsModule } from './reservations/reservations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { MessagingModule } from './messaging/messaging.module';
import { SystemsModule } from './systems/systems.module';
import { SchedulersModule } from './schedulers/schedulers.module';
import { ConcurrencyModule } from './concurrency/concurrency.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ReservationsModule,
    ConcurrencyModule,
    MessagingModule.register(),
    SystemsModule,
    SchedulersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
