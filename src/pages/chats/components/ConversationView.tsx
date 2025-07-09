import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../types";

interface ConversationViewProps {
  messages: Message[];
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down") => void;
}

export const ConversationView = ({ messages, onCopy, onFeedback }: ConversationViewProps) => {
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            onCopy={onCopy}
            onFeedback={onFeedback}
          />
        ))}
      </div>
    </ScrollArea>
  );
};