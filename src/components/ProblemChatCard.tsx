import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ProblemChat } from "@/hooks/useProblemChats";

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
              <div className="space-y-4">
                {/* Problem Statement */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Original Problem:</h4>
                  <div className="text-sm bg-muted/50 p-3 rounded-md leading-relaxed">
                    {problemChat.problem_statement}
                  </div>
                </div>

                {/* Current State/Response */}
                {problemChat.current_state && 
                 problemChat.current_state !== 'draft' && 
                 problemChat.current_state !== 'generating' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">AI Analysis:</h4>
                    <div className="text-sm bg-primary/5 p-3 rounded-md leading-relaxed">
                      {problemChat.current_state}
                    </div>
                  </div>
                )}

                {problemChat.current_state === 'generating' && (
                  <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    Generating AI analysis...
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(problemChat.problem_statement)}
                  >
                    Copy Problem
                  </Button>
                  {problemChat.current_state && 
                   problemChat.current_state !== 'draft' && 
                   problemChat.current_state !== 'generating' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopy(problemChat.current_state)}
                    >
                      Copy Response
                    </Button>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Problem #{problemChat.problem_number}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};