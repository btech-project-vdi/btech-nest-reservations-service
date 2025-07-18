import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export const validateReservationDate = (date: string, index?: number) => {
  const today = new Date();
  const reservationDate = new Date(date + 'T00:00:00');

  const todayStr = today.toISOString().split('T')[0];
  const resDateStr = reservationDate.toISOString().split('T')[0];

  if (resDateStr < todayStr)
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message:
        `La fecha de reserva (${date}) no puede ser anterior a la fecha actual (${todayStr})` +
        (index !== undefined ? ` (fila ${index + 1})` : ''),
    });
};
