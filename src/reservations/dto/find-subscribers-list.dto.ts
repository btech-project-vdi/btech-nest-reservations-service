import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindSubscribersListDto extends PaginationDto {
  @IsString({
    message: 'El campo subscriptionDetailId debe ser una cadena de caracteres.',
  })
  @IsUUID('4', {
    message: 'El campo subscriptionDetailId debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'El campo subscriptionDetailId no puede estar vacío.',
  })
  subscriptionDetailId: string;
}
