
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, EntityType } from './types';

const getTitle = (entity: any, entityType: EntityType): string => {
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
  if (entityType === 'mediaKit' && entity) {
    return entity.mediaKitNumber ? `Media Kit: ${entity.mediaKitNumber}` : 'Media Kit Generation';
  }
  return 'AI Chat';
};

const generateMediaKitNumber = (count: number): string => {
  const nextNumber = count + 1;
  return `MK${nextNumber.toString().padStart(5, '0')}`;
};

const generateProblemNumber = (count: number): string => {
  const nextNumber = count + 1;
  return `P${nextNumber.toString().padStart(5, '0')}`;
};

export const useSessionManager = (entity: any, entityType: EntityType) => {
  const saveChatSession = useCallback(async (messages: Message[], sessionId: string | null, setSessionId: (id: string) => void) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let title = getTitle(entity, entityType);
      
      // For new problem sessions, generate a sequential problem number
      if (entityType === 'problem' && !sessionId && !entity?.problemNumber) {
        // Get count of existing problem sessions for this user
        const { count } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .like('title', 'Problem: P%');
        
        const problemNumber = generateProblemNumber(count || 0);
        // Update entity with the problem number for future reference
        if (entity) {
          entity.problemNumber = problemNumber;
        }
        title = `Problem: ${problemNumber}`;
      }

      // For new media kit sessions, generate a sequential media kit number
      if (entityType === 'mediaKit' && !sessionId && !entity?.mediaKitNumber) {
        // Get count of existing media kit sessions for this user
        const { count } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .like('title', 'Media Kit: MK%');
        
        const mediaKitNumber = generateMediaKitNumber(count || 0);
        // Update entity with the media kit number for future reference
        if (entity) {
          entity.mediaKitNumber = mediaKitNumber;
        }
        title = `Media Kit: ${mediaKitNumber}`;
      }

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

      let chatSessionId = sessionId;

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
        chatSessionId = data.id;
        setSessionId(data.id);
      }

      // For problem type, update the problem chat entry with the chat session ID
      if (entityType === 'problem' && chatSessionId && entity?.problemNumber) {
        await supabase
          .from('problem_chats')
          .update({ chat_session_id: chatSessionId })
          .eq('user_id', user.id)
          .eq('problem_number', entity.problemNumber);
      }

    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }, [entity, entityType]);

  return { saveChatSession };
};
