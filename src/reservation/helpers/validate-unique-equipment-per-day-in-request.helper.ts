import { HttpStatus } from '@nestjs/common';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { RpcException } from '@nestjs/microservices';

export const validateUniqueEquipmentPerDayInRequest = (
  details: CreateReservationDetailDto[],
): void => {
  const uniqueEquipmentDayCombinations = new Set<string>();

  for (const detail of details) {
    const normalizedDate = new Date(detail.initialDate)
      .toISOString()
      .split('T')[0];
    const key = `${detail.laboratoryEquipmentId}_${normalizedDate}`;

    if (uniqueEquipmentDayCombinations.has(key)) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El equipo con ID '${detail.laboratoryEquipmentId}' ya ha sido reservado para la fecha '${normalizedDate}' en esta misma solicitud. Un equipo no puede reservarse más de una vez por día en la misma petición.`,
      });
    }
    uniqueEquipmentDayCombinations.add(key);
  }
};
