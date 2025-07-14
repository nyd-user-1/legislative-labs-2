
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}

export const useChatLogic = (entity: any, entityType: 'bill' | 'member' | 'committee' | 'problem' | null) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getTitle = useCallback(() => {
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
  }, [entity, entityType]);

  const initializeSession = useCallback(async (withInitialMessage = false) => {
    if (!withInitialMessage || !entity) return;

    setIsLoading(true);
    try {
      let prompt = "";
      let summaryContent = "";

      if (entityType === 'problem') {
        summaryContent = entity.originalStatement || entity.description;
        prompt = `Please provide a refined problem statement in memo format for the following problem description:

"${entity.originalStatement || entity.description}"

Format your response as a professional policy memo with:
1. A clear problem identification
2. Impact analysis on affected parties  
3. Assessment of current legal/regulatory gaps
4. Justification for legislative action needed
5. Professional policy language

Keep it structured and comprehensive but concise.`;
      } else if (entityType === 'bill') {
        summaryContent = entity.title || entity.description || "Bill analysis";
        prompt = `Please provide a comprehensive analysis of this bill: ${entity.bill_number}. Include summary, key provisions, and potential impact.`;
      } else {
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { 
          prompt, 
          type: entityType === 'problem' ? 'problem-refinement' : 'analysis',
          entityContext: { type: entityType, [entityType]: entity }
        }
      });

      if (error) {
        console.error('Error calling OpenAI function:', error);
        toast({
          title: "Error",
          description: "Failed to generate initial analysis. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Create initial messages with summary and detailed response
      const summaryMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: summaryContent,
        timestamp: new Date()
      };

      const analysisMessage: Message = {
        id: generateId(),
        role: "assistant", 
        content: data.generatedText || 'Unable to generate analysis. Please try again.',
        timestamp: new Date()
      };

      setMessages([summaryMessage, analysisMessage]);

    } catch (error) {
      console.error('Error in initializeSession:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [entity, entityType, toast]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      let contextualPrompt = message;
      
      if (entityType === 'problem' && entity) {
        // Add context for problem-specific prompts
        const problemContext = `Context: We are analyzing this problem statement: "${entity.originalStatement || entity.description}"

User question: ${message}

Please provide a detailed response addressing the user's question in the context of this problem statement.`;
        contextualPrompt = problemContext;
      }

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { 
          prompt: contextualPrompt,
          type: 'chat',
          entityContext: { type: entityType, [entityType]: entity }
        }
      });

      if (error) {
        console.error('Error calling OpenAI function:', error);
        throw new Error('Failed to generate response');
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.generatedText || 'Unable to generate response. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [entity, entityType, toast]);

  const handleShareChat = useCallback(() => {
    toast({
      title: "Share functionality",
      description: "Share functionality will be implemented soon.",
    });
  }, [toast]);

  return {
    inputValue,
    setInputValue,
    isLoading,
    messages,
    citations,
    sendMessage,
    handleShareChat,
    getTitle,
    initializeSession
  };
};
