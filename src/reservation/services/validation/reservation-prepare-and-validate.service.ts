import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SessionUserDataDto } from 'src/common/dto/session-user-data-dto';
import { ReservationLaboratoryEquipment } from 'src/reservation-laboratory-equipment/entities/reservation-laboratory-equipment.entity';
import { ReservationLaboratoryEquipmentValidationService } from 'src/reservation-laboratory-equipment/services/validation/reservation-laboratory-equipment-validation.service';
import { CreateReservationDetailDto } from 'src/reservation/dto/create-reservation-detail.dto';
import { validateSelfOverlappingReservations } from 'src/reservation/helpers/validate-selft-overlapping-reservations.helper';
import { validateUniqueEquipmentPerDayInRequest } from 'src/reservation/helpers/validate-unique-equipment-per-day-in-request.helper';

@Injectable()
export class ReservationPrepareAndValidateService {
  constructor(
    private readonly reservationLaboratoryEquipmentValidationService: ReservationLaboratoryEquipmentValidationService,
  ) {}

  async execute(
    user: SessionUserDataDto,
    reservationDetails: CreateReservationDetailDto[],
  ): Promise<ReservationLaboratoryEquipment[]> {
    // 1. Validaciones "locales" (dentro de la misma solicitud)
    validateSelfOverlappingReservations(reservationDetails);
    validateUniqueEquipmentPerDayInRequest(reservationDetails);

    // Determinar el rango de fechas de la nueva reserva
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    if (reservationDetails.length === 0)
      throw new RpcException({
        code: HttpStatus.BAD_REQUEST,
        message:
          'La solicitud de reserva no contiene detalles. Por favor, agregue detalles a la solicitud de reserva.',
      });

    for (const detail of reservationDetails) {
      const currentDate = new Date(detail.initialDate);
      if (isNaN(currentDate.getTime()))
        throw new RpcException({
          code: HttpStatus.BAD_REQUEST,
          message: `La fecha de inicio de la reserva no es válida: ${detail.initialDate}`,
        });
      if (!minDate || currentDate < minDate) minDate = currentDate;
      if (!maxDate || currentDate > maxDate) maxDate = currentDate;
    }

    // Ampliar el rango de búsqueda para incluir el día completo de la fecha final
    const searchStartDate = minDate as Date;
    const searchEndDate = new Date((maxDate as Date).getTime());
    searchEndDate.setDate(searchEndDate.getDate() + 1);

    // Obtener todas las reservas existentes del usuario para el rango de fechas relevante
    const existingUserReservations =
      await this.reservationLaboratoryEquipmentValidationService.findReservationsByUserAndDateRange(
        user.subscriberId,
        searchStartDate,
        searchEndDate,
      );

    return existingUserReservations;
  }
}
