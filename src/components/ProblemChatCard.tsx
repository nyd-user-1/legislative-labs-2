
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Heart } from "lucide-react";
import { format } from "date-fns";
import { ProblemChat } from "@/hooks/useProblemChats";
import { ProblemConversationView } from "@/components/ProblemConversationView";
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
  const { toast } = useToast();
  
  // Placeholder for problem favorites (since no problem favorites system exists yet)
  const [isFavorited, setIsFavorited] = useState(false);

  // Calculate message count based on actual content
  const getMessageCount = () => {
    let count = 1; // Always have the problem statement
    if (problemChat.current_state && 
        problemChat.current_state !== 'draft' && 
        problemChat.current_state !== 'generating') {
      count += 1; // Add AI analysis if available
    }
    return count;
  };

  const messageCount = getMessageCount();

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
          <AccordionItem value="problem-content" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              View problem details
            </AccordionTrigger>
            <AccordionContent>
              <ProblemConversationView
                problemChat={problemChat}
                onCopy={onCopy}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
