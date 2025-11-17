import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DayOfWeekEnum } from 'src/common/enums/day-of-week.enum';

export const isValidDayOfWeek = (dayOfWeek: string, date: string): void => {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (isNaN(parsedDate.getTime())) {
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: 'Fecha inválida',
    });
  }
  const actualDayIndex = parsedDate.getDay(); // 0 = Domingo
  const expectedDayName = DayOfWeekEnum[actualDayIndex]; // 'Lunes', etc.
  if (expectedDayName.toLowerCase() !== dayOfWeek.toLowerCase()) {
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: `El día de la semana no coincide con la fecha. Esperado: ${expectedDayName}, recibido: ${dayOfWeek}`,
    });
  }
};
