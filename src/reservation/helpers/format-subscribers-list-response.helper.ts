import { Reservation } from '../entities/reservation.entity';
import {
  NaturalPersonCompleteInfoDto,
  SubscriberWithNaturalPersonDataDto,
} from 'src/communications/grpc/dto/find-subscribers-with-natural-persons.dto';

export const formatSubscribersListResponse = (
  reservations: Reservation[],
): SubscriberWithNaturalPersonDataDto[] => {
  return reservations.map((r) => {
    const naturalPerson = r.metadata?.naturalPerson as
      | NaturalPersonCompleteInfoDto
      | undefined;

    return {
      subscriberId: r.subscriberId,
      username: r.username,
      naturalPerson: naturalPerson
        ? {
            naturalPersonId: naturalPerson.naturalPersonId || '',
            personId: '',
            fullName: naturalPerson.fullName || '',
            paternalSurname: naturalPerson.paternalSurname || '',
            maternalSurname: naturalPerson.maternalSurname || '',
            documentNumber: naturalPerson.documentNumber || '',
            documentType: naturalPerson.documentType || '',
            personInformation: naturalPerson.personInformation || [],
          }
        : null,
    };
  });
};
