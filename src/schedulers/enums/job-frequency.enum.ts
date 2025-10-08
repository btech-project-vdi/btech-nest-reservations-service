export enum JobFrequency {
  EVERY_MINUTE = '0 * * * * *',
  EVERY_5_MINUTES = '0 */5 * * * *',
  EVERY_10_MINUTES = '0 */10 * * * *',
  EVERY_15_MINUTES = '0 */15 * * * *',
  EVERY_30_MINUTES = '0 */30 * * * *',
  EVERY_HOUR = '0 0 * * * *',
  DAILY_AT_2AM = '0 0 2 * * *',
  WEEKLY_SUNDAY_2AM = '0 0 2 * * 0',
}
