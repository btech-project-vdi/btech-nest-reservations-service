export class SendLabReservationReminderEmailDto {
  to: string;
  companyName: string;
  logoUrl: string;
  userName: string;
  reminderMinutes: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  labDescription: string;
  equipmentDescription: string;
  primaryColor: string;
}
