
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, EntityType } from './types';
import { generateId } from './utils';

export const useSessionInitializer = (entity: any, entityType: EntityType) => {
  const initializeSession = useCallback(async (
    withInitialMessage: boolean,
    setMessages: (messages: Message[]) => void,
    setIsLoading: (loading: boolean) => void,
    saveChatSession: (messages: Message[]) => void
  ) => {
    if (!withInitialMessage || !entity) return;

    setIsLoading(true);

    try {
      let initialPrompt = '';

      if (entityType === 'member') {
        const memberName = entity.name || 'this member';
        initialPrompt = `I'm here to help you analyze ${memberName}'s legislative activities and provide insights about their work in the New York State Legislature. What would you like to know about ${memberName}?`;
      } else if (entityType === 'bill') {
        const billTitle = entity.title || entity.bill_number || 'this bill';
        initialPrompt = `I'm ready to analyze ${billTitle} and provide detailed insights about this legislation. What specific aspects would you like to explore?`;
      } else if (entityType === 'committee') {
        const committeeName = entity.committee_name || 'this committee';
        initialPrompt = `I can help you understand ${committeeName}'s activities, jurisdiction, and current legislative work. What would you like to know?`;
      } else if (entityType === 'problem') {
        initialPrompt = `Please analyze this problem statement and provide insights on potential legislative solutions: "${entity.originalStatement || entity.description}"`;
      } else if (entityType === 'solution') {
        initialPrompt = `Please analyze this policy solution and provide detailed implementation guidance: "${entity.originalStatement || entity.description}"`;
      } else if (entityType === 'mediaKit') {
        // Create comprehensive initial media kit prompt with actual solution content
        const solutionContent = entity.solutionContent || entity.originalStatement || entity.description;
        
        initialPrompt = `Please create a comprehensive media kit for the following policy solution:

POLICY SOLUTION:
${solutionContent}

Generate a complete media kit that includes:

1. **PROFESSIONAL PRESS RELEASE** - Using the actual policy name, specific mechanisms, timeline, and outcomes mentioned in the solution
2. **STRATEGIC TALKING POINTS** - Key messages for stakeholders based on the actual benefits and implementation strategy
3. **STAKEHOLDER-SPECIFIC MESSAGING** - Targeted communications for the specific audiences identified in the policy
4. **CONCRETE ACTION STEPS** - Specific actions supporters can take based on the implementation and engagement plans

Use the real details, names, timelines, and specifics from the policy solution. Do not use generic placeholders.`;
      }

      if (initialPrompt) {
        const { data, error } = await supabase.functions.invoke('generate-with-openai', {
          body: { 
            prompt: initialPrompt,
            type: entityType === 'mediaKit' ? 'media' : 'chat',
            entityContext: { type: entityType, [entityType]: entity }
          }
        });

        if (error) {
          console.error('Error initializing session:', error);
          throw new Error('Failed to initialize session');
        }

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: data.generatedText || 'Hello! How can I help you today?',
          timestamp: new Date()
        };

        const initialMessages = [assistantMessage];
        setMessages(initialMessages);
        await saveChatSession(initialMessages);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      // Set a fallback message if initialization fails
      const fallbackMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Hello! I'm ready to help you with your legislative analysis. How can I assist you today?",
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [entity, entityType]);

  return { initializeSession };
};
