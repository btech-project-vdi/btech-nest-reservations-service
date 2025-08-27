import { SubscriberWithNaturalPersonDataDto } from 'src/grpc/dto/find-subscribers-with-natural-persons.dto';

export const filterSubscribersByTerm = (
  subscribers: SubscriberWithNaturalPersonDataDto[],
  term: string,
): SubscriberWithNaturalPersonDataDto[] => {
  if (!term || term.trim() === '') {
    return subscribers;
  }

  const searchTerm = term.toLowerCase().trim();

  return subscribers.filter((subscriber) => {
    const { username, naturalPerson } = subscriber;
    const {
      fullName,
      paternalSurname,
      maternalSurname,
      documentNumber,
      documentType,
      personInformation,
    } = naturalPerson;

    const searchFields = [
      username,
      fullName,
      paternalSurname,
      maternalSurname,
      documentNumber,
      documentType,
      ...personInformation.map((info) => info.description),
    ];

    return searchFields.some((field) =>
      field?.toLowerCase().includes(searchTerm),
    );
  });
};
