import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfirmListReservationDto } from 'src/reservation-process-history/dto/confirm-list-reservation.dto';
import { ReservationLaboratoryEquipmentCustomService } from 'src/reservation-laboratory-equipment/services/custom';

@Injectable()
export class ReservationProcessHistoryConfirmListService {
  constructor(
    @Inject(forwardRef(() => ReservationLaboratoryEquipmentCustomService))
    private readonly reservationLaboratoryEquipmentCustomService: ReservationLaboratoryEquipmentCustomService,
  ) {}

  async execute(confirmListReservationDto: ConfirmListReservationDto) {
    const { status, ...paginationDto } = confirmListReservationDto;
    return await this.reservationLaboratoryEquipmentCustomService.confirmListReservation(
      paginationDto,
      status,
    );
  }
}
