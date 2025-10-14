/**
 * Determina qué clave de contraseña usar según la hora de la reserva
 * Rangos de horarios definidos por el sistema:
 * - 00:00 - 02:59 → dawn1 (madrugada 1)
 * - 03:00 - 06:59 → dawn2 (madrugada 2)
 * - 07:00 - 10:54 → morning1 (mañana 1)
 * - 10:55 - 15:00 → morning2 (mañana 2)
 * - 15:01 - 19:15 → afternoon (tarde)
 * - 19:16 - 23:59 → night (noche)
 */
export const getPasswordKeyByTime = (hour: string): string => {
  const [hours, minutes] = hour.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  // dawn1: 00:00 - 02:59
  if (totalMinutes >= 0 && totalMinutes <= 179) return 'dawn1';
  // dawn2: 03:00 - 06:59
  if (totalMinutes >= 180 && totalMinutes <= 419) return 'dawn2';
  // morning1: 07:00 - 10:54
  if (totalMinutes >= 420 && totalMinutes <= 654) return 'morning1';
  // morning2: 10:55 - 15:00
  if (totalMinutes >= 655 && totalMinutes <= 900) return 'morning2';
  // afternoon: 15:01 - 19:15
  if (totalMinutes >= 901 && totalMinutes <= 1155) return 'afternoon';
  // night: 19:16 - 23:59
  if (totalMinutes >= 1156 && totalMinutes <= 1439) return 'night';
  // Por defecto, retornar night (esto no debería ocurrir con validaciones correctas)
  return 'night';
};
