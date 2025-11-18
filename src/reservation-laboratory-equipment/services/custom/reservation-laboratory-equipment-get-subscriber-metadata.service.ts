import { Injectable } from '@nestjs/common';
import { SubscribersClient } from 'src/communications/grpc/clients/subscribers.client';
import { getCurrentDateInTimezone } from 'src/schedulers/helpers/timezone.helper';

@Injectable()
export class ReservationLaboratoryEquipmentGetSubscriberMetadataService {
  constructor(private readonly subscribersClient: SubscribersClient) {}

  async execute(
    subscriberId: string,
    username: string,
  ): Promise<Record<string, any>> {
    try {
      // Obtener información del perfil del suscriptor desde gRPC
      const userProfile = await this.subscribersClient.findUserProfile({
        subscriberId,
        service: 'VDI',
      });
      // Verificar si se encontró información del usuario
      if (!userProfile || !userProfile.naturalPerson)
        // Si no se encuentra información, devolver metadata básica
        return {
          'Codigo de usuario': username,
          'Fecha de creación':
            getCurrentDateInTimezone('America/Lima').toISOString(),
        };
      const naturalPerson = userProfile.naturalPerson;
      // Formatear la metadata según la estructura requerida
      const metadata = {
        naturalPerson: {
          fullName: naturalPerson.fullName,
          documentType: naturalPerson.documentType,
          documentNumber: naturalPerson.documentNumber,
          maternalSurname: naturalPerson.maternalSurname,
          naturalPersonId: naturalPerson.naturalPersonId,
          paternalSurname: naturalPerson.paternalSurname,
          personInformation: naturalPerson.personInformation.map((info) => ({
            description: info.description,
            informationType: info.informationType,
          })),
        },
        'Codigo de usuario': username,
        'Fecha de creación':
          getCurrentDateInTimezone('America/Lima').toISOString(),
      };
      return metadata;
    } catch (error) {
      // En caso de error con el servicio gRPC, devolver metadata básica
      console.error(
        'Error al obtener metadata del suscriptor desde gRPC:',
        error,
      );
      return {
        'Codigo de usuario': username,
        'Fecha de creación':
          getCurrentDateInTimezone('America/Lima').toISOString(),
      };
    }
  }
}
