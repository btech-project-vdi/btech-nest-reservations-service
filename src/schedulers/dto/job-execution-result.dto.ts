import { JobStatus } from '../enums/job-status.enum';

export class JobExecutionResultDto {
  success: boolean;
  status: JobStatus;
  executionTime: number;
  data?: any;
  error?: string;
  affectedRows?: number;
}
