
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ChatSession } from "../types";
import { ConversationView } from "./ConversationView";
import { parseMessages } from "../utils/messageParser";
import { getBillChamber } from "@/hooks/chat/utils";

interface ChatSessionCardProps {
  session: ChatSession;
  onDelete: (sessionId: string) => void;
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down") => void;
}

export const ChatSessionCard = ({
  session,
  onDelete,
  onCopy,
  onFeedback
}: ChatSessionCardProps) => {
  const messages = parseMessages(session.messages);
  const messageCount = messages.length;

  // Extract chamber information for bill sessions
  const getChamberInfo = () => {
    if (session.title.startsWith('Analysis:') && session.bill_id) {
      // Extract bill number from title (e.g., "Analysis: S1234" -> "S1234")
      const billNumber = session.title.replace('Analysis: ', '');
      const chamber = getBillChamber(billNumber);
      return chamber;
    }
    return null;
  };

  const chamberInfo = getChamberInfo();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{format(new Date(session.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
              <span>{messageCount} messages</span>
              {chamberInfo && <span>{chamberInfo}</span>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(session.id)}
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
