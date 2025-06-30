/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createLogInfo } from '../helpers/create-log-info.helper';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly serviceName: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    // Obtener contexto del microservicio
    const rpcContext = context.switchToRpc();
    const pattern = rpcContext.getContext();
    const baseInfo = createLogInfo(pattern, this.serviceName);

    // 📥 LOG DE RPC REQUEST ENTRANTE
    this.logger.log(
      `📥 RPC ${pattern} - Service: ${this.serviceName} - User: ${baseInfo.userId}`,
    );

    return next.handle().pipe(
      tap({
        next: (response) => {
          // ✅ LOG DE SUCCESS
          const duration = Date.now() - startTime;
          const responseSize = JSON.stringify(response || {}).length;

          this.logger.log({
            ...baseInfo,
            level: 'SUCCESS',
            response: {
              duration: `${duration}ms`,
              size: `${responseSize} bytes`,
            },
          });
        },
        error: (error: Error) => {
          // ❌ LOG DE ERROR (sin modificar el error)
          const duration = Date.now() - startTime;

          this.logger.error({
            ...baseInfo,
            level: 'ERROR',
            error: {
              type: error.constructor.name,
              message: error.message,
              stack: error.stack?.split('\n').slice(0, 10),
            },
            context: {
              handler: context.getHandler().name,
              class: context.getClass().name,
              duration: `${duration}ms`,
            },
          });
        },
      }),
    );
  }
}
