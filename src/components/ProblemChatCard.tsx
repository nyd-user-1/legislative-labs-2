import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Heart } from "lucide-react";
import { format } from "date-fns";
import { ProblemChat } from "@/hooks/useProblemChats";
import { ConversationView } from "@/pages/chats/components/ConversationView";
import { parseMessages } from "@/pages/chats/utils/messageParser";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/pages/chats/types";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Placeholder for problem favorites (since no problem favorites system exists yet)
  const [isFavorited, setIsFavorited] = useState(false);

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

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For now, just toggle local state until problem favorites system is implemented
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Problem removed from your favorites" : "Problem added to your favorites",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{problemChat.title}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFavorite}
                className="h-auto p-1 hover:bg-transparent"
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
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
          <AccordionItem value="chat-content" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              View conversation
            </AccordionTrigger>
            <AccordionContent>
              <ConversationView
                messages={messages}
                onCopy={onCopy}
                onFeedback={onFeedback}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};