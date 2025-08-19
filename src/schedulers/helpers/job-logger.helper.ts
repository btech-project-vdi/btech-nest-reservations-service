/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { JobExecutionResultDto } from '../dto/job-execution-result.dto';
import { JobExecutionLog } from '../interfaces/job-execution-log.interface';

@Injectable()
export class JobLoggerHelper {
  private readonly logger = new Logger('SchedulerJobs');

  logExecution(jobName: string, result: JobExecutionResultDto): void {
    const logEntry: JobExecutionLog = {
      jobName,
      status: result.status,
      executionTime: result.executionTime,
      timestamp: new Date(),
      result: result.data,
      error: result.error,
    };

    if (result.success) {
      this.logger.log(
        `Job "${jobName}" ejecutado exitosamente en ${result.executionTime}ms. Filas afectadas: ${result.affectedRows || 0}`,
        JSON.stringify(logEntry),
      );
    } else {
      this.logger.error(
        `Job "${jobName}" falló después de ${result.executionTime}ms. Error: ${result.error}`,
        JSON.stringify(logEntry),
      );
    }
  }

  logJobStart(jobName: string): void {
    this.logger.log(`Iniciando job "${jobName}"`);
  }

  logJobScheduled(jobName: string, frequency: string): void {
    this.logger.log(`Job "${jobName}" programado con frecuencia: ${frequency}`);
  }
}
