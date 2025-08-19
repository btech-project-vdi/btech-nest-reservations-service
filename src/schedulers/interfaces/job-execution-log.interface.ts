import { JobStatus } from '../enums/job-status.enum';

export interface JobExecutionLog {
  jobName: string;
  status: JobStatus;
  executionTime: number;
  timestamp: Date;
  result?: any;
  error?: string;
}
