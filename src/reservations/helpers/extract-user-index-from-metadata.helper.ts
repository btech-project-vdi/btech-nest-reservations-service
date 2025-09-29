export const extractUserIndexFromMetadata = (
  metadata: Record<string, any>,
): number => {
  const equipmentName = metadata['username'] as string;
  if (!equipmentName) return -1;
  // Extraer el número del formato LABxxxCIS-XX
  const match = equipmentName.match(/-(\d+)$/);
  if (match) {
    const equipmentNumber = parseInt(match[1]);
    return equipmentNumber === 0 ? 0 : equipmentNumber; // DOC = 0, 01-30 = 1-30
  }
  // Si es DOC
  if (equipmentName.includes('-DOC')) return 0;
  return -1;
};
