import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { FindOneByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-by-laboratory-equipment-id.dto';
import { CreateReservationDetailDto } from 'src/reservation/dto/create-reservation-detail.dto';
import { ValidateHoursDisponibilityDto } from 'src/reservation/dto/validate-hours-disponibility.dto';

@Injectable()
export class ReservationValidateConsecutiveDaysService {
  async execute(
    detail: CreateReservationDetailDto,
    user: SessionUserDataDto,
    userId: string,
    laboratory: FindOneByLaboratoryEquipmentIdResponseDto,
    nextDayName: string,
    validateHoursCallback: (
      dto: ValidateHoursDisponibilityDto,
      userId: string,
    ) => Promise<any[]>,
  ) {
    // Validar parte del día inicial (desde initialHour hasta 23:59)
    const initialDayAvailability = await validateHoursCallback(
      {
        dayOfWeek: detail.dayName,
        date: detail.initialDate.split('T')[0],
        initialHour: detail.initialHour,
        finalHour: '23:59',
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );
    // Calcular fecha del día siguiente
    const nextDayDate = new Date(detail.initialDate);
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    const nextDayDateStr = nextDayDate.toISOString().split('T')[0];
    // Validar parte del día siguiente (desde 00:00 hasta finalHour)
    const nextDayAvailability = await validateHoursCallback(
      {
        dayOfWeek: nextDayName,
        date: nextDayDateStr,
        initialHour: '00:00',
        finalHour: detail.finalHour,
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );

    if (initialDayAvailability.length === 0 || nextDayAvailability.length === 0)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El laboratorio no tiene programación disponible para la reserva que cruza medianoche entre ${detail.dayName} y ${nextDayName}`,
      });
  }
}
