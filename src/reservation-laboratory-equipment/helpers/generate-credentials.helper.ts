/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ReservationCredentials } from '../interfaces/reservation-credentials.interface';
import { getPasswordKeyByTime } from './get-password-key-by-time.helper';

export const generateCredentials = (
  laboratoryMetadata: Record<string, any>,
  laboratoryEquipmentId: string,
  userIndex: number,
  reservationHour: string,
): ReservationCredentials => {
  // Determinar el nombre del equipo basándose en el índice
  const equipmentKeys = Object.keys(laboratoryMetadata);
  const equipmentPattern =
    equipmentKeys.find((key) => key.includes('-DOC')) || '';
  const labPrefix = equipmentPattern.replace('-DOC', '');
  let equipmentName: string;
  if (userIndex === 0) {
    equipmentName = `${labPrefix}-DOC`;
  } else {
    equipmentName = `${labPrefix}-${userIndex.toString().padStart(2, '0')}`;
  }
  // Obtener las credenciales de la metadata del laboratorio
  const equipmentCredentials = laboratoryMetadata[equipmentName];
  if (!equipmentCredentials)
    throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `No se encontraron credenciales para el equipo ${equipmentName}`,
    });
  // Determinar qué contraseña usar según la hora de la reserva
  const passwordKey = getPasswordKeyByTime(reservationHour);
  let password = equipmentCredentials[passwordKey] as string;
  // Si no existe la credencial para ese turno, usar fallback a 'night' (por defecto)
  if (!password) {
    password = equipmentCredentials.night as string;
    // Si tampoco existe 'night', lanzar error
    if (!password)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El laboratorio ${labPrefix} no tiene credenciales disponibles para el turno ${passwordKey} ni credenciales por defecto. Contacte al administrador.`,
      });
  }
  return {
    accessUrl: 'https://ucv.ia4cloud.com', // URL base del VDI
    username: equipmentName,
    password: password,
  };
};
