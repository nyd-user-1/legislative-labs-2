
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message, Citation, EntityType } from './chat/types';
import { getTitle } from './chat/utils';
import { useSessionManager } from './chat/useSessionManager';
import { useMessageHandler } from './chat/useMessageHandler';
import { useSessionInitializer } from './chat/useSessionInitializer';

export const useChatLogic = (entity: any, entityType: EntityType) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  const { saveChatSession } = useSessionManager(entity, entityType);
  const { sendMessage: handleSendMessage } = useMessageHandler(entity, entityType);
  const { initializeSession: handleInitialization } = useSessionInitializer(entity, entityType);

  const wrappedSaveChatSession = useCallback(async (messages: Message[], title?: string) => {
    await saveChatSession(messages, sessionId, setSessionId);
  }, [saveChatSession, sessionId]);

  const sendMessage = useCallback(async (message: string) => {
    await handleSendMessage(
      message,
      messages,
      setMessages,
      setIsLoading,
      wrappedSaveChatSession
    );
  }, [handleSendMessage, messages, wrappedSaveChatSession]);

  const initializeSession = useCallback(async (withInitialMessage = false) => {
    await handleInitialization(
      withInitialMessage,
      setMessages,
      setIsLoading,
      wrappedSaveChatSession
    );
  }, [handleInitialization, wrappedSaveChatSession]);

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
    inputValue,
    setInputValue,
    isLoading,
    messages,
    citations,
    sendMessage,
    handleShareChat,
    getTitle: getTitleCallback,
    initializeSession
  };
};
