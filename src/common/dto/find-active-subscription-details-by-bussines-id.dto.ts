import { IsNotEmpty, IsUUID } from 'class-validator';

export class FindActiveSubscriptionDetailsByBussinesIdDto {
  @IsNotEmpty({ message: 'El ID de suscripción empresarial es requerido' })
  @IsUUID('all', {
    message: 'El ID de suscripción empresarial debe ser un UUID válido',
  })
  subscriptionBussineId: string;
}

export class FindActiveSubscriptionDetailsByBussinesIdResponseDto {
  subscriptionDetailId: string;
  serviceId: string;
}
