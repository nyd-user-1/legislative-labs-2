
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message, EntityType, Citation } from './types';
import { generateId } from './utils';

// Extract citations from response content and entity information
const extractCitationsFromResponse = (content: string, entity: any, entityType: EntityType): Citation[] => {
  const citations: Citation[] = [];
  
  // Generate citations based on entity type and content
  if (entityType === 'bill' && entity) {
    citations.push({
      id: generateId(),
      title: `NY State Bill ${entity.bill_number || 'N/A'}`,
      url: entity.state_link || entity.url || '',
      excerpt: `${entity.title || 'Bill information'} - Status: ${entity.status_desc || 'Unknown'}`
    });
    
    // Add Legiscan citation if available
    if (entity.url) {
      citations.push({
        id: generateId(),
        title: 'Legiscan Database',
        url: entity.url,
        excerpt: 'Legislative tracking and bill information from Legiscan'
      });
    }
  }
  
  if (entityType === 'member' && entity) {
    citations.push({
      id: generateId(),
      title: `NY State ${entity.chamber || 'Legislature'} - ${entity.name || 'Member'}`,
      url: entity.nys_bio_url || '',
      excerpt: `${entity.party || ''} representative for District ${entity.district || 'N/A'}`
    });
    
    // Add additional member sources
    if (entity.ballotpedia) {
      citations.push({
        id: generateId(),
        title: 'Ballotpedia Profile',
        url: entity.ballotpedia,
        excerpt: 'Comprehensive political information and voting record'
      });
    }
  }
  
  if (entityType === 'committee' && entity) {
    citations.push({
      id: generateId(),
      title: `${entity.committee_name || entity.name || 'Committee'} - NY State ${entity.chamber || 'Legislature'}`,
      url: entity.committee_url || '',
      excerpt: `Committee information including membership, jurisdiction, and current agenda`
    });
  }
  
  // Add NYS Open Legislation API as a general source
  citations.push({
    id: generateId(),
    title: 'NY State Open Legislation API',
    url: 'https://legislation.nysenate.gov/api/3/',
    excerpt: 'Official New York State legislative data and documentation'
  });
  
  return citations.filter(citation => citation.url); // Only return citations with valid URLs
};

export const useMessageHandler = (entity: any, entityType: EntityType) => {
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    message: string,
    messages: Message[],
    setMessages: (messages: Message[]) => void,
    setIsLoading: (loading: boolean) => void,
    saveChatSession: (messages: Message[]) => void,
    setCitations?: (citations: any[]) => void
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
        // Enhanced context for media kit-specific prompts with actual solution content
        const solutionContent = entity.solutionContent || entity.originalStatement || entity.description;
        
        const mediaKitContext = `Context: You are creating comprehensive media kit materials for the following policy solution:

POLICY SOLUTION CONTENT:
${solutionContent}

User request: ${message}

Based on the specific policy solution provided above, create detailed and tailored media materials that include:

1. **DRAFT PRESS RELEASE**: Create a professional press release using the actual policy name, specific mechanisms, implementation timeline, and expected outcomes from the solution. Include real quotes and concrete details from the policy.

2. **KEY TALKING POINTS**: Extract and organize the main benefits, implementation strategies, and expected outcomes from the actual policy solution. Include specific statistics, timelines, and stakeholder information mentioned in the solution.

3. **STAKEHOLDER MESSAGING**: Create targeted messaging for the specific stakeholders mentioned in the policy solution (government agencies, non-profits, community members, etc.).

4. **ACTIONABLE STEPS**: Provide concrete actions based on the implementation strategy and stakeholder engagement plan outlined in the policy solution.

Make sure to:
- Use the actual policy name and specific details from the solution
- Reference real implementation phases, timelines, and metrics mentioned
- Include specific benefits and outcomes outlined in the policy
- Address the actual target population and geographic scope mentioned
- Incorporate the real stakeholder analysis and engagement strategies

DO NOT use generic placeholders like [Policy Solution Name] or [Organization Name]. Use the specific details and names from the actual policy solution provided.`;
        
        contextualPrompt = mediaKitContext;
      }

      // Determine the appropriate context type for the AI
      let contextType = 'chat';
      if (entityType === 'problem') {
        contextType = 'problem';
      } else if (entityType === 'solution') {
        contextType = 'idea';
      } else if (entityType === 'mediaKit') {
        contextType = 'media';
      } else {
        // For bills, members, committees - use 'chat' type for comprehensive analysis
        contextType = 'chat';
      }

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { 
          prompt: contextualPrompt,
          type: contextType,
          entityContext: { type: entityType, [entityType]: entity },
          enhanceWithNYSData: true
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

      // Extract and store citations from the response
      if (setCitations && data.citations) {
        setCitations(data.citations);
      } else if (setCitations) {
        // Generate citations based on the entity and response content
        const extractedCitations = extractCitationsFromResponse(data.generatedText, entity, entityType);
        setCitations(extractedCitations);
      }

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
