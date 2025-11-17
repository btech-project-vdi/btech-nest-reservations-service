import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationLaboratoryEquipment } from '../../entities/reservation-laboratory-equipment.entity';
import { RpcException } from '@nestjs/microservices';
import { FindOneReservationLaboratoryEquipmentResponseDto } from 'src/reservation/dto/find-one-reservation-laboratory-equipment.dto';
import { formatReservationLaboratoryEquipmentResponse } from 'src/reservation-laboratory-equipment/helpers/format-reservation-laboratory-equipment-response.helper';

@Injectable()
export class ReservationLaboratoryEquipmentFindOneService {
  constructor(
    @InjectRepository(ReservationLaboratoryEquipment)
    private readonly reservationLaboratoryEquipmentRepository: Repository<ReservationLaboratoryEquipment>,
  ) {}

  async execute(
    reservationLaboratoryEquipmentId: string,
  ): Promise<FindOneReservationLaboratoryEquipmentResponseDto> {
    const reservationLaboratoryEquipment =
      await this.reservationLaboratoryEquipmentRepository.findOne({
        where: { reservationLaboratoryEquipmentId },
      });
    if (!reservationLaboratoryEquipment)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `El item de reserva con el id ${reservationLaboratoryEquipmentId} no se encuentra registrado`,
      });
    return formatReservationLaboratoryEquipmentResponse(
      reservationLaboratoryEquipment,
    );
  }
}
