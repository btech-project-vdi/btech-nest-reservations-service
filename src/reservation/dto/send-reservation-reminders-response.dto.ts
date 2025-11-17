export class SendReservationRemindersResponseDto {
  processed: number;
  sentALE1: number;
  sentALE2: number;
  sentALE3: number;
  totalSent: number;
  executedAt: Date;
  message: string;
}
