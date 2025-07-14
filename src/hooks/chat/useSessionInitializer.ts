
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, EntityType } from './types';
import { generateId, getTitle } from './utils';

export const useSessionInitializer = (entity: any, entityType: EntityType) => {
  const { toast } = useToast();

  const initializeSession = useCallback(async (
    withInitialMessage: boolean,
    setMessages: (messages: Message[]) => void,
    setIsLoading: (loading: boolean) => void,
    saveChatSession: (messages: Message[], title: string) => void
  ) => {
    if (!withInitialMessage || !entity) return;

    setIsLoading(true);
    try {
      let prompt = "";

      if (entityType === 'problem') {
        // Create the user message first
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
      await saveChatSession(newMessages, '');

      // For problem type, also create a problem chat entry
      if (entityType === 'problem') {
        await createProblemChatEntry(entity, newMessages);
      }

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

  const createProblemChatEntry = async (entity: any, messages: Message[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the next problem number
      const { data: problemNumber } = await supabase.rpc('generate_problem_number');
      
      if (!problemNumber) {
        console.error('Failed to generate problem number');
        return;
      }

      // Create problem chat entry
      const { error } = await supabase
        .from('problem_chats')
        .insert({
          user_id: user.id,
          problem_number: problemNumber,
          title: entity.title || 'Problem Statement',
          problem_statement: entity.originalStatement || entity.description,
          current_state: 'Problem Identified'
        });

      if (error) {
        console.error('Error creating problem chat entry:', error);
      }
    } catch (error) {
      console.error('Error in createProblemChatEntry:', error);
    }
  };

  return { initializeSession };
};
