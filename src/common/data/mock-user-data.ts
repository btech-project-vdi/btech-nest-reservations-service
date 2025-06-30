import { ValidateUserResponseDto } from '../dto/validate-user-response.dto';
import { StatusSubscription } from '../enums/status-subscription.enum';

export const mockUserData: ValidateUserResponseDto = {
  subscriberId: '7c9e6679-7425-40de-944b-e07fc1f90ae',
  username: '70125834',
  isTwoFactorEnabled: false,
  roles: ['CLIENTE'],
  naturalPerson: {
    naturalPersonId: '123e4567-e89b-12d3-a456-426614174000',
    personId: 'person-456e7890-f12g-34h5-i678-901234567def',
    fullName: 'Jose Armando',
    paternalSurname: 'Menacho',
    maternalSurname: 'Minchola',
    documentNumber: '70125834',
    documentType: 'DNI',
    personInformation: [
      {
        informationType: 'Email',
        description: 'josmendev@gmail.com',
      },
    ],
  },
  subscription: {
    subscriptionId: '123e4567-e89b-12d3-a456-426614174001',
    subscriptionBussineId: '123e4567-e89b-12d3-a456-426614174001',
    status: StatusSubscription.ACTIVE,
    initialDate: '2025-05-16 00:00:00',
    finalDate: '2025-12-16 00:00:00',
    url: 'divisa',
    subscriptionDesign: {
      subscriptionsDesigneSettingId: '8f3c02a4-5e20-4e13-9801-0d82fcbd7f3a',
      url: 'tou',
      brandOne:
        'https://firebasestorage.googleapis.com/v0/b/test-project-3657a.appspot.com/o/bands-tech%2Flogo-toulouse-index.png?alt=media&token=22b7831f-24de-425f-bcad-a246436177db',
      brandTwo: undefined,
      brandThree: undefined,
      brandFour: undefined,
      primaryColor: '#440099',
      secondaryColor: undefined,
      baseColor: undefined,
      infoColor: undefined,
      warningColor: undefined,
      successColor: undefined,
      errorColor: undefined,
      lightColor: undefined,
      darkColor: undefined,
      letterFont: undefined,
    },
    person: {
      personId: '9b2d4a6e-8b7a-4c51-82f0-9edc2e839e77',
      fullName: 'Toulouse',
    },
  },
};
