import { BadRequestException, HttpStatus } from '@nestjs/common';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto';
import { ReservationLaboratoryEquipment } from '../entities/reservation-laboratory-equipment.entity';
import { getMinutesFromHours } from './get-minutes-from-hours.helper';
import { RpcException } from '@nestjs/microservices';

export const checkExistingUserReservations = (
  newDetail: CreateReservationDetailDto,
  existingUserReservations: ReservationLaboratoryEquipment[],
): void => {
  const newDate = new Date(newDetail.initialDate).toISOString().split('T')[0];
  const newInitialMinutes = getMinutesFromHours(newDetail.initialHour);
  const newFinalMinutes = getMinutesFromHours(newDetail.finalHour);

  for (const existingRes of existingUserReservations) {
    const existingResDate = new Date(existingRes.reservationDate)
      .toISOString()
      .split('T')[0];
    const existingResInitialMinutes = getMinutesFromHours(
      existingRes.initialHour,
    );
    const existingResFinalMinutes = getMinutesFromHours(existingRes.finalHour);

    // --- REGLA 1: Mismo Laboratorio/Equipo, Mismo Día (en otras reservas del mismo usuario) ---
    // Si el equipo es el mismo Y la fecha es la misma, es un conflicto sin importar la hora.
    if (
      existingResDate === newDate &&
      existingRes.laboratoryEquipmentId === newDetail.laboratoryEquipmentId
    ) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Ya tiene una reserva para el equipo seleccionado el día ${newDate} en otra de sus reservas existentes. Un equipo no puede reservarse más de una vez por día para el mismo usuario.`,
      });
    }
    if (existingResDate === newDate) {
      // Comprobar solapamiento de tiempo
      const overlap =
        (newInitialMinutes < existingResFinalMinutes &&
          newFinalMinutes > existingResInitialMinutes) ||
        (existingResInitialMinutes < newFinalMinutes &&
          existingResFinalMinutes > newInitialMinutes);

      if (overlap) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: `Ya tiene una reserva que se solapa el día ${newDate} de ${existingRes.initialHour}-${existingRes.finalHour} en otro laboratorio. No puede reservar en la misma fecha y hora.`,
        });
      }
    }
  }
};
