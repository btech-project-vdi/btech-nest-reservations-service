export const checkTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean => {
  // Dos rangos de tiempo se solapan si: (start1 < end2) AND (end1 > start2)
  return start1 < end2 && end1 > start2;
};
