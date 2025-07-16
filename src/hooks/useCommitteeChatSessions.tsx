
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Committee = {
  committee_id: number;
  committee_name: string;
  description?: string;
};

export const useCommitteeChatSessions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createOrGetChatSession = useCallback(async (committee: Committee) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // For mock committees (committee_id 0 or null), don't create database sessions
      if (!committee.committee_id) {
        return null;
      }

      // Check if a chat session already exists for this committee
      const { data: existingSession, error: fetchError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("committee_id", committee.committee_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingSession) {
        return existingSession;
      }

      // Create a new chat session - but only set committee_id if it exists in the Committees table
      const sessionData: any = {
        user_id: user.id,
        title: `Committee: ${committee.committee_name}`,
        messages: JSON.stringify([])
      };

      // Only add committee_id if it's a real committee (not mock data)
      if (committee.committee_id > 0) {
        sessionData.committee_id = committee.committee_id;
      }

      const { data: newSession, error: createError } = await supabase
        .from("chat_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (createError) throw createError;

      return newSession;
    } catch (error) {
      console.error("Error creating/getting chat session:", error);
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    createOrGetChatSession,
    loading,
  };
};
