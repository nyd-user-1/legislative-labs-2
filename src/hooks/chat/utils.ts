
// Generate sequential problem number
export const generateProblemNumber = (count: number): string => {
  return `P${String(count + 1).padStart(5, '0')}`;
};

// Generate sequential media kit number
export const generateMediaKitNumber = (count: number): string => {
  return `MK${String(count + 1).padStart(5, '0')}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getTitle = (entity: any, entityType: 'bill' | 'member' | 'committee' | 'problem' | 'solution' | 'mediaKit' | null) => {
  if (entityType === 'bill' && entity?.bill_number) {
    return `Analysis: ${entity.bill_number}`;
  }
  if (entityType === 'member' && entity?.name) {
    return `Member: ${entity.name}`;
  }
  if (entityType === 'committee' && entity?.name) {
    return `Committee: ${entity.name}`;
  }
  if (entityType === 'problem' && entity?.problemNumber) {
    return `Problem: ${entity.problemNumber}`;
  }
  if (entityType === 'solution' && entity?.problemNumber) {
    return `Solution: ${entity.problemNumber}`;
  }
  if (entityType === 'mediaKit' && entity?.mediaKitNumber) {
    return `Media Kit: ${entity.mediaKitNumber}`;
  }
  return 'AI Assistant';
};

export const getBillChamber = (billNumber: string): string => {
  if (!billNumber) return '';
  const upperBillNumber = billNumber.toUpperCase();
  if (upperBillNumber.startsWith('S')) return 'Senate';
  if (upperBillNumber.startsWith('A')) return 'Assembly';
  return '';
};
