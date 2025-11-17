import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class GrpcMetadataClientInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Este interceptor se ejecuta en el CLIENTE antes de enviar la llamada gRPC
    // Aquí podríamos inyectar metadata si tuviéramos acceso al contexto de la llamada
    // Pero con el patrón actual de NestJS ClientGrpc + Observables, no es posible

    return next.handle();
  }
}
