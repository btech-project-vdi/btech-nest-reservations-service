export class FindDaysWithDetailsDto {
  programmingDayId: string;
  programmingSubscriptionDetail: ProgrammingSubscriptionDetailResponseDto;
  day: DayResponseDto;
  hours: HourResponseDto[];
}

export class ProgrammingSubscriptionDetailResponseDto {
  programmingSubscriptionDetailId: string;
  initialDate: string;
  finalDate: string;
  status: string;
}

export class DayResponseDto {
  dayId: string;
  description: string;
}

export class HourResponseDto {
  programmingHoursId: string;
  initialHour: string;
  finalHour: string;
}
