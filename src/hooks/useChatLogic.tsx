
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
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  const saveChatSession = useCallback(async (messages: Message[], title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const sessionData = {
        user_id: user.id,
        bill_id: entityType === 'bill' ? entity?.bill_id : null,
        member_id: entityType === 'member' ? entity?.people_id : null,
        committee_id: entityType === 'committee' ? entity?.committee_id : null,
        title: title,
        messages: JSON.stringify(messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })))
      };

      if (sessionId) {
        // Update existing session
        const { error } = await supabase
          .from("chat_sessions")
          .update(sessionData)
          .eq("id", sessionId);
        
        if (error) throw error;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from("chat_sessions")
          .insert(sessionData)
          .select()
          .single();
        
        if (error) throw error;
        setSessionId(data.id);
      }
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }, [sessionId, entity, entityType]);

  const initializeSession = useCallback(async (withInitialMessage = false) => {
    if (!withInitialMessage || !entity) return;

    setIsLoading(true);
    try {
      let prompt = "";
      const title = getTitle();

      if (entityType === 'problem') {
        // First, add the user's original problem statement as a user message
        const userMessage: Message = {
          id: generateId(),
          role: "user",
          content: entity.originalStatement || entity.description,
          timestamp: new Date()
        };

        setMessages([userMessage]);

        // Then generate the refined analysis
        prompt = `Please provide a refined problem statement for the following problem description:

"${entity.originalStatement || entity.description}"

Provide a clear, structured analysis that includes:
1. A clear problem identification
2. Impact analysis on affected parties  
3. Assessment of current legal/regulatory gaps
4. Justification for legislative action needed
5. Professional policy language

Keep it structured and comprehensive but concise. Do not include memorandum formatting, headers, or formal document structure.`;
      } else if (entityType === 'bill') {
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

      // Add the AI response to the existing user message
      const analysisMessage: Message = {
        id: generateId(),
        role: "assistant", 
        content: data.generatedText || 'Unable to generate analysis. Please try again.',
        timestamp: new Date()
      };

      const newMessages = entityType === 'problem' 
        ? [
            {
              id: generateId(),
              role: "user" as const,
              content: entity.originalStatement || entity.description,
              timestamp: new Date()
            },
            analysisMessage
          ]
        : [analysisMessage];

      setMessages(newMessages);

      // Save the session immediately after creating initial messages
      await saveChatSession(newMessages, title);

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
  }, [entity, entityType, toast, getTitle, saveChatSession]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save updated messages to database
      await saveChatSession(finalMessages, getTitle());

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
  }, [messages, entity, entityType, toast, saveChatSession, getTitle]);

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
