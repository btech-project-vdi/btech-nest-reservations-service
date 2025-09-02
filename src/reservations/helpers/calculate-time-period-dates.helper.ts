import { TimePeriod } from '../enums/time-period.enum';

export interface TimePeriodDates {
  fromDate?: Date;
  toDate?: Date;
}

export const calculateTimePeriodDates = (
  timePeriod: TimePeriod,
  startDate?: string,
  endDate?: string,
): TimePeriodDates => {
  if (!timePeriod) return {};

  const now = new Date();
  let fromDate: Date | undefined;
  let toDate: Date = now;

  switch (timePeriod) {
    case TimePeriod.CUSTOM:
      if (startDate && endDate) {
        fromDate = new Date(startDate);
        toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
      }
      break;

    case TimePeriod.LAST_DAY:
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 1);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;

    case TimePeriod.LAST_WEEK:
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 7);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;

    case TimePeriod.LAST_30_DAYS:
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 30);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;

    case TimePeriod.LAST_3_MONTHS:
      fromDate = new Date(now);
      fromDate.setMonth(now.getMonth() - 3);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;

    case TimePeriod.LAST_YEAR:
      fromDate = new Date(now);
      fromDate.setMonth(now.getMonth() - 12);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;

    case TimePeriod.CURRENT_MONTH:
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      toDate.setHours(23, 59, 59, 999);
      break;
  }

  return { fromDate, toDate };
};
