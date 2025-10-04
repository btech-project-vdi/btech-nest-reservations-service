export class EmailNotificationDataDto {
  logoUrl: string;
  finalHour: string;
  companyName: string;
  initialHour: string;
  primaryColor: string;
  laboratoryName: string;
  subscriberName: string;
  reservationDate: string;
  subscriberEmail: string;
}

export class EmailNotificationMetadataDto {
  password: string;
  username: string;
  accessUrl: string;
  emailNotificationData: EmailNotificationDataDto;
}

export class SendLabEquipmentReservationCancellationEmailDto {
  reservationLaboratoryEquipmentId: string;
  metadata: EmailNotificationMetadataDto;
  subscriptionDetailId: string;
}

export class SendLabEquipmentReservationCancellationEmailResponseDto {
  success: boolean;
  message: string;
  error?: string;
}
