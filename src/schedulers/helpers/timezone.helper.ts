export const getCurrentDateInTimezone = (
  timezone: string = 'America/Lima',
): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
};

export const formatDateForDatabase = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};
