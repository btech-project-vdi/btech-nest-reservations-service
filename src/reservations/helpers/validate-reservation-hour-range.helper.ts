import { RpcException } from '@nestjs/microservices';

export const validateReservationHourRange = (
  initialHour: string,
  finalHour: string,
  isSameDay: boolean, // Nuevo parámetro para indicar si es el mismo día
  index?: number,
) => {
  // Solo validar si es el mismo día
  if (isSameDay) {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const initial = toMinutes(initialHour);
    const final = toMinutes(finalHour);

    if (initial >= final)
      throw new RpcException({
        status: 400,
        message:
          `La hora inicial (${initialHour}) debe ser menor que la hora final (${finalHour})` +
          (index !== undefined ? ` (fila ${index + 1})` : ''),
      });
    if (initial === final)
      throw new RpcException({
        status: 400,
        message: `La hora inicial (${initialHour}) y la hora final (${finalHour}) no pueden ser iguales`,
      });
  }
};
