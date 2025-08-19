/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ReservationLaboratoryEquipmentService } from '../../reservations/services/reservation-laboratory-equipment.service';
import {
  SchedulableJob,
  JobContext,
} from '../interfaces/schedulable-job.interface';
import { JobExecutionResultDto } from '../dto/job-execution-result.dto';
import { JobStatus } from '../enums/job-status.enum';

@Injectable()
export class CompleteFinishedReservationsJob implements SchedulableJob {
  name = 'complete-finished-reservations';
  description =
    'Marca como completadas las reservas que han terminado su tiempo programado';

  constructor(
    private readonly reservationLaboratoryEquipmentService: ReservationLaboratoryEquipmentService,
  ) {}

  async execute(context: JobContext): Promise<JobExecutionResultDto> {
    const startTime = Date.now();

    try {
      const result =
        await this.reservationLaboratoryEquipmentService.completeFinishedReservations(
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
      return {
        success: false,
        status: JobStatus.FAILED,
        executionTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }
}
