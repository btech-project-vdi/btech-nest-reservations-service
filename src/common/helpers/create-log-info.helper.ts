import { LogInfo } from '../interfaces/log-info.interface';

export function createLogInfo(pattern: string, serviceName: string): LogInfo {
  return {
    timestamp: new Date().toISOString(),
    service: serviceName,
    pattern: pattern || 'unknown',
    userId: 'anonymous',
  };
}
