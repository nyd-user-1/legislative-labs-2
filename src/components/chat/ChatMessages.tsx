
import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/pages/chats/components/MessageBubble";
import { Message as ChatMessage } from "@/pages/chats/types";
import { EntityType } from "@/hooks/chat/types";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onCopy: (text: string) => void;
  onShare: () => void;
  onSendPrompt: (prompt: string) => void;
  entity: any;
  entityType: EntityType;
  onFeedback: (type: "thumbs-up" | "thumbs-down" | "citations") => void;
}

export const ChatMessages = ({
  messages,
  isLoading,
  onCopy,
  onShare,
  onSendPrompt,
  entity,
  entityType,
  onFeedback
}: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          // Convert Date to string for MessageBubble compatibility
          const chatMessage: ChatMessage = {
            ...message,
            timestamp: message.timestamp.toISOString()
          };
          
          // Check if this is the first assistant message
          const assistantMessageIndex = messages.filter((m, i) => i <= index && m.role === 'assistant').length;
          const isFirstAssistantMessage = message.role === 'assistant' && assistantMessageIndex === 1;
          
          return (
            <MessageBubble 
              key={message.id}
              message={chatMessage}
              onCopy={onCopy}
              onFeedback={onFeedback}
              onShare={onShare}
              onSendPrompt={onSendPrompt}
              entity={entity}
              entityType={entityType as 'bill' | 'member' | 'committee'}
              isFirstAssistantMessage={isFirstAssistantMessage}
            />
          );
        })}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-start">
              <div className="w-full rounded-lg p-3 bg-muted flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <MorphingHeartLoader size={20} className="text-red-500" />
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
