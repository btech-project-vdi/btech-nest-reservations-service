import { RpcException } from '@nestjs/microservices';

export const handleValidationError = (
  error: unknown,
  defaultMessage: string = 'Error de validación',
): string => {
  if (error instanceof RpcException) {
    const rpcError = error.getError();
    if (typeof rpcError === 'string') return rpcError;
    if (rpcError && typeof rpcError === 'object' && 'message' in rpcError)
      return String(rpcError.message);
  }
  if (error instanceof Error && error.message) return error.message;
  return defaultMessage;
};
