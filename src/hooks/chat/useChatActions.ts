
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message, EntityType } from './types';
import { getTitle } from './utils';

export const useChatActions = (entity: any, entityType: EntityType) => {
  const { toast } = useToast();

  const handleShareChat = useCallback(() => {
    toast({
      title: "Share functionality",
      description: "Share functionality will be implemented soon.",
    });
  }, [toast]);

  const getTitleCallback = useCallback(() => {
    return getTitle(entity, entityType);
  }, [entity, entityType]);

  return {
    handleShareChat,
    getTitle: getTitleCallback
  };
};
