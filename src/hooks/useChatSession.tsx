import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  billId?: number | null;
}

export const useChatSession = (billId?: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("");

  const saveMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const createNewSession = useCallback((title: string) => {
    setMessages([]);
    setSessionId(null);
    setSessionTitle(title);
  }, []);

  const saveSession = useCallback(async () => {
    if (messages.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const sessionData = {
        user_id: user.id,
        bill_id: billId,
        title: sessionTitle || "AI Chat Session",
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
      console.error("Error saving session:", error);
      throw error;
    }
  }, [messages, sessionId, sessionTitle, billId]);

  const loadSession = useCallback(async (sessionIdToLoad: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionIdToLoad)
        .single();

      if (error) throw error;

      if (data) {
        setSessionId(data.id);
        setSessionTitle(data.title);
        
        const parsedMessages = JSON.parse(String(data.messages) || "[]").map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error("Error loading session:", error);
      throw error;
    }
  }, []);

  const deleteSession = useCallback(async (sessionIdToDelete: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionIdToDelete);

      if (error) throw error;

      if (sessionIdToDelete === sessionId) {
        setMessages([]);
        setSessionId(null);
        setSessionTitle("");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }, [sessionId]);

  return {
    messages,
    sessionId,
    sessionTitle,
    saveMessage,
    saveSession,
    loadSession,
    createNewSession,
    deleteSession,
  };
};