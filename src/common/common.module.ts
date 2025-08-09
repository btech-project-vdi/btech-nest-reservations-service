import { Module } from '@nestjs/common';
import { AdminLaboratoriesService } from './services/admin-laboratories.service';
import { AdminProgrammingService } from './services/admin-programming.service';
import { TransactionService } from './services/transaction.service';

@Module({
  providers: [
    AdminLaboratoriesService,
    AdminProgrammingService,
    TransactionService,
  ],
  exports: [
    AdminLaboratoriesService,
    AdminProgrammingService,
    TransactionService,
  ],
})
export class CommonModule {}
