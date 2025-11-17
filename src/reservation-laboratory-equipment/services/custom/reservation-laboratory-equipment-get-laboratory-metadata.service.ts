import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AdminLaboratoriesService } from 'src/common/services/admin-laboratories.service';

@Injectable()
export class ReservationLaboratoryEquipmentGetLaboratoryMetadataService {
  constructor(
    private readonly adminLaboratoriesService: AdminLaboratoriesService,
  ) {}

  async execute(laboratoryEquipmentId: string): Promise<Record<string, any>> {
    const equipment =
      await this.adminLaboratoriesService.findOneByLaboratoryEquipmentId(
        laboratoryEquipmentId,
      );
    if (!equipment?.metadata)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `No se encontró metadata para el laboratorio del equipo ${laboratoryEquipmentId}`,
      });
    return equipment.metadata;
  }
}
