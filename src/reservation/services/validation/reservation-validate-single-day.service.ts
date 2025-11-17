import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { FindOneByLaboratoryEquipmentIdResponseDto } from 'src/common/dto/find-one-by-laboratory-equipment-id.dto';
import { CreateReservationDetailDto } from 'src/reservation/dto/create-reservation-detail.dto';
import { ValidateHoursDisponibilityDto } from 'src/reservation/dto/validate-hours-disponibility.dto';

@Injectable()
export class ReservationValidateSingleDayService {
  async execute(
    detail: CreateReservationDetailDto,
    user: SessionUserDataDto,
    laboratory: FindOneByLaboratoryEquipmentIdResponseDto,
    userId: string,
    validateHoursCallback: (
      dto: ValidateHoursDisponibilityDto,
      userId: string,
    ) => Promise<any[]>,
  ) {
    const availability = await validateHoursCallback(
      {
        dayOfWeek: detail.dayName,
        date: detail.initialDate.split('T')[0],
        initialHour: detail.initialHour,
        finalHour: detail.finalHour,
        subscriptionDetailId: user.subscription.subscriptionDetailId,
        numberReservationDays: laboratory.parameters.numberReservationDay,
      },
      userId,
    );

    if (availability.length === 0) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `El laboratorio no tiene programación disponible para ${detail.dayName} entre ${detail.initialHour} y ${detail.finalHour}`,
      });
    }
  }
}
