import { SubscriberInfoDto } from 'src/common/dto/subscriber-info.dto';
import { LaboratoryEquipmentFindAllResponseDto } from './reservation-detail-find-all.dto';

export class ConfirmListReservationDto {
  reservationLaboratoryEquipmentId: string;
  createdAt: string;
  subscriber?: SubscriberInfoDto;
  laboratoryEquipment: LaboratoryEquipmentFindAllResponseDto;
  reservationDate: string;
  reservationFinalDate: string;
  initialHour: string;
  finalHour: string;
  metadata?: Record<string, string>;
  status: string;
}
