import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ProblemChat } from "@/hooks/useProblemChats";
import { ProblemConversationView } from "./ProblemConversationView";

interface ProblemChatCardProps {
  problemChat: ProblemChat;
  onDelete: (chatId: string) => void;
  onCopy: (text: string) => void;
}

export const ProblemChatCard = ({
  problemChat,
  onDelete,
  onCopy,
}: ProblemChatCardProps) => {
  // Create a mock message count for display consistency
  const messageCount = problemChat.current_state === 'generating' ? 0 : 1;

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
              {problemChat.current_state === 'generating' && (
                <span className="text-yellow-600">Generating...</span>
              )}
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