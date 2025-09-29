export const findAvailableUserIndex = (
  conflictingIndices: number[],
): number => {
  // Buscar primero desde el índice 1-30 (LAB-01 hasta LAB-30)
  for (let i = 1; i <= 30; i++) {
    if (!conflictingIndices.includes(i)) return i;
  }
  // Si todos los regulares están ocupados, asignar DOC (índice 0)
  if (!conflictingIndices.includes(0)) return 0;

  // Si todos están ocupados, asignar uno aleatorio (esto no debería pasar normalmente)
  return Math.floor(Math.random() * 31);
};
