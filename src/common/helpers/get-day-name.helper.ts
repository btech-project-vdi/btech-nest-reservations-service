export const getNextDayName = (dayName: string): string => {
  const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  const currentIndex = days.indexOf(dayName);
  return days[(currentIndex + 1) % 7];
};
