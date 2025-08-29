import { FindAvailableLaboratoriesEquipmentsForUserResponseDto } from 'src/common/dto/find-available-laboratories-equipments-for-user.dto';

export const formatFindAvailableLaboratoriesForUserResponse = (
  laboratories: FindAvailableLaboratoriesEquipmentsForUserResponseDto[],
  laboratoryEquipmentIdsWithReservations: string[],
): FindAvailableLaboratoriesEquipmentsForUserResponseDto[] => {
  return laboratories.filter((lab) =>
    laboratoryEquipmentIdsWithReservations.includes(lab.laboratoryEquipmentId),
  );
};
