import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { JobFrequency } from '../enums/job-frequency.enum';

export class SchedulerConfigDto {
  @IsString()
  jobName: string;

  @IsString()
  frequency: JobFrequency;

  @IsOptional()
  @IsString()
  timezone?: string = 'America/Lima';

  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;

  @IsOptional()
  metadata?: Record<string, any>;
}
