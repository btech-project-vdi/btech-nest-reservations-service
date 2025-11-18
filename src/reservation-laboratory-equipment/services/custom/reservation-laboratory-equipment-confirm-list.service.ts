import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/helpers/paginate.helper';
import { Paginated } from 'src/common/dto/paginated.dto';
import { formatConfirmListReservationResponse } from 'src/reservation-laboratory-equipment/helpers/format-confirm-list-reservation-response.helper';
import { ReservationCustomService } from 'src/reservation/services/custom';
import { ConfirmListReservationResponseDto } from 'src/reservation-process-history/dto/confirm-list-reservation.dto';
import { StatusReservation } from 'src/reservation/enums/status-reservation.enum';

@Injectable()
export class ReservationLaboratoryEquipmentConfirmListService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
    @Inject(forwardRef(() => ReservationCustomService))
    private readonly reservationCustomService: ReservationCustomService,
  ) {}

  async execute(
    paginationDto: PaginationDto,
    status: StatusReservation | undefined,
  ): Promise<Paginated<ConfirmListReservationResponseDto>> {
    const whereCondition = status ? { status: status } : {};
    const reservationLaboratoryEquipment =
      await this.reservationLaboratoryEquipmentRepository.find({
        relations: ['reservation'],
        order: {
          createdAt: 'ASC',
        },
        where: whereCondition,
      });
    const laboratoryEquipmentIds = reservationLaboratoryEquipment.map(
      (rle) => rle.laboratoryEquipmentId,
    );
    const equipmentMap =
      await this.reservationCustomService.findEquipmentMapData(
        laboratoryEquipmentIds,
      );
    const confirmListReservations = formatConfirmListReservationResponse(
      reservationLaboratoryEquipment,
      equipmentMap,
    );
    return await paginate(confirmListReservations, paginationDto);
  }
}
