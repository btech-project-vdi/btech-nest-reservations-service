/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { RpcError } from '../interfaces/rpc-error.interface';

@Catch() // Captura todos los errores
export class ServiceExceptionFilter implements ExceptionFilter {
  constructor(private readonly serviceName: string) {}

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string[] = ['Error interno del microservicio'];
    let errorType = 'UNKNOWN';

    // 1. Si viene JSON string desde VDI (gRPC o NATS) - pasar como string al gateway
    const jsonMatch = exception.message?.match(/\{.*\}/);
    if (jsonMatch) return throwError(() => new RpcException(jsonMatch[0]));

    // Si ya es una RpcException, verificamos si tiene la información del servicio
    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as RpcError;

      if (this.isRpcError(rpcError)) {
        console.log('rpcError', rpcError);
        // Si ya tiene toda la información necesaria, solo agregamos el servicio si falta
        if (!rpcError.service) {
          const enhancedError = {
            ...rpcError,
            service: this.serviceName,
          };
          return throwError(
            () => new RpcException(JSON.stringify(enhancedError)),
          );
        }
        // Si ya tiene toda la información, la pasamos tal como está
        return throwError(() => new RpcException(JSON.stringify(rpcError)));
      }
    }

    // Manejo de errores de QueryFailedError de TypeORM
    if (this.isQueryFailedError(exception)) {
      errorType = 'QUERY_ERROR';
      const queryErrorResponse = this.handleQueryFailedError(exception);
      console.log('queryErrorResponse', queryErrorResponse);
      status = queryErrorResponse.status;
      message = queryErrorResponse.message;
    }
    // Manejo de errores de base de datos
    else if (this.isDatabaseError(exception)) {
      errorType = 'DATABASE_ERROR';
      const dbErrorResponse = this.handleDatabaseError(exception);
      status = dbErrorResponse.status;
      message = dbErrorResponse.message;
    }
    // Manejo de errores de validación de TypeORM/class-validator
    else if (this.isValidationError(exception)) {
      errorType = 'VALIDATION_ERROR';
      status = HttpStatus.BAD_REQUEST;
      message = this.extractValidationMessages(exception);
    }
    // Si es una RpcException existente pero sin estructura correcta
    else if (exception instanceof RpcException) {
      errorType = 'RPC_ERROR';
      const error = exception.getError();
      message = typeof error === 'string' ? [error] : [String(error)];
    }
    // Errores generales
    else {
      errorType = 'GENERAL_ERROR';
      message = [exception?.message || 'Error desconocido en el microservicio'];
      status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return throwError(
      () =>
        new RpcException(
          JSON.stringify({
            status,
            message,
            service: this.serviceName,
          }),
        ),
    );
  }

  private isRpcError(error: any): error is RpcError {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('status' in error || 'message' in error) // Al menos uno de los dos debe existir
    );
  }

  private isDatabaseError(error: any): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('errno' in error || 'code' in error) &&
      (error.sqlMessage !== undefined || error.detail !== undefined)
    );
  }

  private isValidationError(error: any): boolean {
    return (
      Array.isArray(error) ||
      error?.name === 'ValidationError' ||
      error?.constraints !== undefined
    );
  }

  private isQueryFailedError(error: any): boolean {
    return (
      error?.name === 'QueryFailedError' || (error?.driverError && error?.query)
    );
  }

  private handleDatabaseError(error: any): {
    status: number;
    message: string[];
  } {
    const { errno, sqlMessage = '', code, detail = '' } = error;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ['Error de base de datos'];

    // Errores MySQL
    if (errno === 1062 || code === 'ER_DUP_ENTRY') {
      status = HttpStatus.CONFLICT;
      const match = String(sqlMessage).match(
        /Duplicate entry '(.+?)' for key '(.+?)'/,
      );
      if (match) {
        const duplicateValue = match[1];
        const keyName = match[2];
        message = [
          `El valor '${duplicateValue}' ya existe. No se permiten duplicados.`,
        ];
      } else {
        message = ['Ya existe un registro similar. No se permiten duplicados.'];
      }
    } else if (errno === 1364 || code === 'ER_NO_DEFAULT_FOR_FIELD') {
      status = HttpStatus.BAD_REQUEST;
      message = [`Campo requerido faltante: ${sqlMessage}`];
    } else if (errno === 1054 || code === 'ER_BAD_FIELD_ERROR') {
      status = HttpStatus.BAD_REQUEST;
      message = [`Error en la consulta: ${sqlMessage}`];
    } else if (errno === 1146 || code === 'ER_NO_SUCH_TABLE') {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = [`Error de configuración: ${sqlMessage}`];
    } else if (errno === 1452 || code === 'ER_NO_REFERENCED_ROW_2') {
      status = HttpStatus.BAD_REQUEST;
      message = ['El registro referenciado no existe'];
    }
    // Errores PostgreSQL
    else if (code === '23505') {
      // unique_violation
      status = HttpStatus.CONFLICT;
      const match = detail.match(/Key \((.+?)\)=\((.+?)\)/);
      if (match) {
        const field = match[1];
        const value = match[2];
        message = [
          `El valor '${value}' ya existe para ${field}. No se permiten duplicados.`,
        ];
      } else {
        message = ['Ya existe un registro similar. No se permiten duplicados.'];
      }
    } else if (code === '23502') {
      // not_null_violation
      status = HttpStatus.BAD_REQUEST;
      message = [`Campo requerido faltante`];
    } else if (code === '23503') {
      // foreign_key_violation
      status = HttpStatus.BAD_REQUEST;
      message = ['El registro referenciado no existe'];
    }

    return {
      status,
      message,
    };
  }

  private handleQueryFailedError(error: any): {
    status: number;
    message: string[];
  } {
    const driverError = error.driverError || error;
    return this.handleDatabaseError(driverError);
  }

  private extractValidationMessages(error: any): string[] {
    if (Array.isArray(error)) {
      return error.flatMap((err) => {
        if (err.constraints) {
          return Object.values(err.constraints);
        }
        return [err.message || 'Error de validación'];
      });
    }

    if (error.constraints) {
      return Object.values(error.constraints);
    }

    return [error.message || 'Error de validación'];
  }
}
