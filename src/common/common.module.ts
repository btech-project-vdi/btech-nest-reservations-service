import { Module } from '@nestjs/common';
import { AdminLaboratoriesService } from './services/admin-laboratories.service';
import { AdminProgrammingService } from './services/admin-programming.service';

@Module({
  providers: [AdminLaboratoriesService, AdminProgrammingService],
  exports: [AdminLaboratoriesService, AdminProgrammingService],
})
export class CommonModule {}
