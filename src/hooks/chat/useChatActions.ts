
import { EntityType } from './types';

export const useChatActions = (entity: any, entityType: EntityType) => {
  const handleShareChat = () => {
    // Implementation for sharing chat
    console.log('Sharing chat for:', entityType, entity);
  };

  const getTitle = () => {
    if (entityType === 'bill' && entity) {
      return `Bill: ${entity.bill_number}`;
    }
    if (entityType === 'member' && entity) {
      return `Member: ${entity.name}`;
    }
    if (entityType === 'committee' && entity) {
      return `Committee: ${entity.name}`;
    }
    if (entityType === 'problem' && entity) {
      return entity.problemNumber ? `Problem: ${entity.problemNumber}` : 'Problem Analysis';
    }
    if (entityType === 'solution' && entity) {
      return entity.problemNumber ? `Solution: ${entity.problemNumber}` : 'Solution Development';
    }
    return 'AI Chat';
  };

  return { handleShareChat, getTitle };
};
