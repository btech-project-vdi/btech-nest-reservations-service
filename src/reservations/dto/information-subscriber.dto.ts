import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsHexColor,
} from 'class-validator';

export class InformationSubscriberDto {
  @IsEmail({}, { message: 'El email debe ser una dirección de correo válida.' })
  @IsNotEmpty({ message: 'El email del suscriptor es requerido.' })
  email: string;

  @IsString({
    message: 'El nombre de la compañía debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'El nombre de la compañía es requerido.' })
  companyName: string;

  @IsUrl({}, { message: 'La URL del logo debe ser una URL válida.' })
  @IsNotEmpty({ message: 'La URL del logo es requerida.' })
  logoUrl: string;

  @IsString({
    message: 'El nombre del suscriptor debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'El nombre del suscriptor es requerido.' })
  subscriberName: string;

  @IsHexColor({
    message:
      'El color primario debe ser un código de color hexadecimal válido (e.g., #RRGGBB).',
  })
  @IsNotEmpty({ message: 'El color primario es requerido.' })
  primaryColor: string;
}
