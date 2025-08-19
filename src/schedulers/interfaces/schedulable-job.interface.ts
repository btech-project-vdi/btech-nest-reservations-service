import { JobExecutionResultDto } from '../dto/job-execution-result.dto';

export interface SchedulableJob {
  name: string;
  description: string;
  execute(context: JobContext): Promise<JobExecutionResultDto>;
}

export interface JobContext {
  timestamp: Date;
  timezone: string;
  metadata?: Record<string, any>;
}
