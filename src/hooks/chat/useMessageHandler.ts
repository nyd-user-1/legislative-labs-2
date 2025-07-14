
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, EntityType } from './types';
import { generateId } from './utils';

export const useMessageHandler = (entity: any, entityType: EntityType) => {
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    message: string,
    messages: Message[],
    setMessages: (messages: Message[]) => void,
    setIsLoading: (loading: boolean) => void,
    saveChatSession: (messages: Message[]) => void
  ) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      let contextualPrompt = message;
      
      if (entityType === 'problem' && entity) {
        // Add context for problem-specific prompts
        const problemContext = `Context: We are analyzing this problem statement: "${entity.originalStatement || entity.description}"

User question: ${message}

Please provide a detailed response addressing the user's question in the context of this problem statement.`;
        contextualPrompt = problemContext;
      } else if (entityType === 'solution' && entity) {
        // Add context for solution-specific prompts
        const solutionContext = `Context: We are developing policy solutions for this problem: "${entity.originalStatement || entity.description}"

User question: ${message}

Please provide a detailed response addressing the user's question in the context of developing effective policy solutions for this problem.`;
        contextualPrompt = solutionContext;
      } else if (entityType === 'mediaKit' && entity) {
        // Add context for media kit-specific prompts
        const mediaKitContext = `Context: We are creating media kit materials (press releases, talking points, persuasion techniques) for this policy solution: "${entity.originalStatement || entity.description}"

User question: ${message}

Please provide a detailed response that includes:
1. Draft press release content
2. Key talking points for stakeholders
3. Conversational techniques to persuade friends and family
4. Actionable steps to advance the solution

Keep the tone professional yet accessible, and focus on compelling messaging that effectively communicates the benefits of this policy solution.`;
        contextualPrompt = mediaKitContext;
      }

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { 
          prompt: contextualPrompt,
          type: entityType === 'mediaKit' ? 'media' : 'chat',
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
      await saveChatSession(finalMessages);

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

  return { sendMessage };
};
