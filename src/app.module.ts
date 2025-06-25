import { Module } from '@nestjs/common';
import { ReservationsModule } from './reservations/reservations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ReservationsModule,
    MessagingModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
