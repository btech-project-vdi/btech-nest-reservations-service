/**
 * Determina qué clave de contraseña usar según la hora de la reserva
 * Rangos de horarios definidos por el sistema (8 turnos de 3 horas cada uno):
 * - 00:00 - 02:59 → dawn1 (madrugada 1)
 * - 03:00 - 05:59 → dawn2 (madrugada 2)
 * - 06:00 - 08:59 → morning1 (mañana 1)
 * - 09:00 - 11:59 → morning2 (mañana 2)
 * - 12:00 - 14:59 → afternoon1 (tarde 1)
 * - 15:00 - 17:59 → afternoon2 (tarde 2)
 * - 18:00 - 20:59 → night1 (noche 1)
 * - 21:00 - 23:59 → night2 (noche 2)
 */
export const getPasswordKeyByTime = (hour: string): string => {
  const [hours, minutes] = hour.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  // dawn1: 00:00 - 02:59 (0-179 min)
  if (totalMinutes >= 0 && totalMinutes <= 179) return 'dawn1';
  // dawn2: 03:00 - 05:59 (180-359 min)
  if (totalMinutes >= 180 && totalMinutes <= 359) return 'dawn2';
  // morning1: 06:00 - 08:59 (360-539 min)
  if (totalMinutes >= 360 && totalMinutes <= 539) return 'morning1';
  // morning2: 09:00 - 11:59 (540-719 min)
  if (totalMinutes >= 540 && totalMinutes <= 719) return 'morning2';
  // afternoon1: 12:00 - 14:59 (720-899 min)
  if (totalMinutes >= 720 && totalMinutes <= 899) return 'afternoon1';
  // afternoon2: 15:00 - 17:59 (900-1079 min)
  if (totalMinutes >= 900 && totalMinutes <= 1079) return 'afternoon2';
  // night1: 18:00 - 20:59 (1080-1259 min)
  if (totalMinutes >= 1080 && totalMinutes <= 1259) return 'night1';
  // night2: 21:00 - 23:59 (1260-1439 min)
  if (totalMinutes >= 1260 && totalMinutes <= 1439) return 'night2';
  // Por defecto, retornar night1 (esto no debería ocurrir con validaciones correctas)
  return 'night1';
};
