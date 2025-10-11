export class GrpcMetadataDto {
  ipAddress?: string;
  userAgent?: string;
  subscriberId?: string;
}

export class SendLabReservationEmailDto {
  to: string;
  companyName: string;
  logoUrl: string;
  userName: string;
  reservationDate: string;
  details: SendLabReservationEmailDetailsDto[];
  primaryColor: string;
  subscriptionDetailId: string;
  grpcMetadata?: GrpcMetadataDto;
}

export class SendLabReservationEmailDetailsDto {
  labDescription: string;
  equipmentDescription: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface SendLabReservationEmailResponseDto {
  success: boolean;
  message: string;
  error?: string;
}
