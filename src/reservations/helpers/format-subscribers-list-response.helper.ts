import { Reservation } from '../entities/reservation.entity';
import {
  NaturalPersonCompleteInfoDto,
  SubscriberWithNaturalPersonDataDto,
} from 'src/grpc/dto/find-subscribers-with-natural-persons.dto';

export const formatSubscribersListResponse = (
  reservations: Reservation[],
): SubscriberWithNaturalPersonDataDto[] => {
  return reservations.map((r) => {
    // const metadata = JSON.parse(r.metadata || '{}');
    const naturalPerson = r.metadata
      .naturalPerson as NaturalPersonCompleteInfoDto;

    return {
      subscriberId: r.subscriberId,
      username: r.username,
      naturalPerson: {
        naturalPersonId: naturalPerson.naturalPersonId || '',
        personId: '',
        fullName: naturalPerson.fullName || '',
        paternalSurname: naturalPerson.paternalSurname || '',
        maternalSurname: naturalPerson.maternalSurname || '',
        documentNumber: naturalPerson.documentNumber || '',
        documentType: naturalPerson.documentType || '',
        personInformation: naturalPerson.personInformation || [],
      },
    };
  });
};
