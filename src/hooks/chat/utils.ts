
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getTitle = (entity: any, entityType: 'bill' | 'member' | 'committee' | 'problem' | null) => {
  if (entityType === 'bill' && entity?.bill_number) {
    return `Analysis: ${entity.bill_number}`;
  }
  if (entityType === 'member' && entity?.name) {
    return `Member: ${entity.name}`;
  }
  if (entityType === 'committee' && entity?.name) {
    return `Committee: ${entity.name}`;
  }
  if (entityType === 'problem' && entity?.id) {
    return `Problem: ${entity.id}`;
  }
  return 'AI Assistant';
};
