import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export const validateReservationHourRange = (
  initialHour: string,
  finalHour: string,
  initialDate: string,
  finalDate: string,
  index?: number,
) => {
  const createDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}:00`);
  };
  const initialDateTime = createDateTime(initialDate, initialHour);
  const finalDateTime = createDateTime(finalDate, finalHour);

  if (finalDateTime <= initialDateTime) {
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message:
        `La fecha/hora final (${finalDate} ${finalHour}) debe ser posterior a la fecha/hora inicial (${initialDate} ${initialHour})` +
        (index !== undefined ? ` (fila ${index + 1})` : ''),
    });
  }

  const isSameDay = initialDate === finalDate;
  if (isSameDay) {
    const timeDifferenceMinutes =
      (finalDateTime.getTime() - initialDateTime.getTime()) / (1000 * 60);
    if (timeDifferenceMinutes < 30) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message:
          `La reserva debe tener una duración mínima de 15 minutos. Duración actual: ${timeDifferenceMinutes} minutos` +
          (index !== undefined ? ` (fila ${index + 1})` : ''),
      });
    }
  }
};
