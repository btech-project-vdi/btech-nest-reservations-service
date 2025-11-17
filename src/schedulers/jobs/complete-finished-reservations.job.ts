import { Injectable } from '@nestjs/common';
import {
  SchedulableJob,
  JobContext,
} from '../interfaces/schedulable-job.interface';
import { JobExecutionResultDto } from '../dto/job-execution-result.dto';
import { JobStatus } from '../enums/job-status.enum';
import { ReservationLaboratoryEquipmentCustomService } from 'src/reservation-laboratory-equipment/services/custom';

@Injectable()
export class CompleteFinishedReservationsJob implements SchedulableJob {
  name = 'complete-finished-reservations';
  description =
    'Marca como completadas las reservas que han terminado su tiempo programado';

  constructor(
    private readonly reservationLaboratoryCustomEquipmentService: ReservationLaboratoryEquipmentCustomService,
  ) {}

  async execute(context: JobContext): Promise<JobExecutionResultDto> {
    const startTime = Date.now();

    try {
      const result =
        await this.reservationLaboratoryCustomEquipmentService.completeFinishedReservations(
          context.timestamp,
        );

      return {
        success: true,
        status: JobStatus.SUCCESS,
        executionTime: Date.now() - startTime,
        data: result,
        affectedRows: result.completedCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al completar las reservas terminadas';
      return {
        success: false,
        status: JobStatus.FAILED,
        executionTime: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }
}
