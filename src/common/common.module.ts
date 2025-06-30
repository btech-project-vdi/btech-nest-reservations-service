import { Module } from '@nestjs/common';
import { AdminLaboratoriesService } from './services/admin-laboratories.service';
import { AdminProgrammingService } from './services/admin-programming.service';
import { AdminSubscriptionsService } from './services/admin-subscriptions.service';

@Module({
  providers: [
    AdminLaboratoriesService,
    AdminProgrammingService,
    AdminSubscriptionsService,
  ],
  exports: [
    AdminLaboratoriesService,
    AdminProgrammingService,
    AdminSubscriptionsService,
  ],
})
export class CommonModule {}
