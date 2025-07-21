import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ProblemChat } from "@/hooks/useProblemChats";
import { ConversationView } from "@/pages/chats/components/ConversationView";
import { parseMessages } from "@/pages/chats/utils/messageParser";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/pages/chats/types";

interface ProblemChatCardProps {
  problemChat: ProblemChat;
  onDelete: (chatId: string) => void;
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down") => void;
}

export const ProblemChatCard = ({
  problemChat,
  onDelete,
  onCopy,
  onFeedback,
}: ProblemChatCardProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatSession = async () => {
      if (!problemChat.chat_session_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("id", problemChat.chat_session_id)
          .single();

        if (error) {
          console.error("Error fetching chat session:", error);
          setLoading(false);
          return;
        }

        if (data) {
          const parsedMessages = parseMessages(data.messages);
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Error parsing messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatSession();
  }, [problemChat.chat_session_id]);

  const messageCount = messages.length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{problemChat.title}</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{format(new Date(problemChat.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
              <span>{messageCount} messages</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(problemChat.id)}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="problem-content" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              View conversation
            </AccordionTrigger>
            <AccordionContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading conversation...</div>
              ) : messages.length > 0 ? (
                <ConversationView
                  messages={messages}
                  onCopy={onCopy}
                  onFeedback={onFeedback}
                />
              ) : (
                <div className="text-sm text-muted-foreground">No conversation available</div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};