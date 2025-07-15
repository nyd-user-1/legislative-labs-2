
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, BookOpen } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { ContextBuilder } from "@/utils/contextBuilder";

interface MessageBubbleProps {
  message: Message;
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down" | "citations") => void;
  onShare?: () => void;
  onSendPrompt?: (prompt: string) => void;
  entity?: any;
  entityType?: 'bill' | 'member' | 'committee' | 'problem' | null;
}

export const MessageBubble = ({ 
  message, 
  onCopy, 
  onFeedback, 
  onShare, 
  onSendPrompt,
  entity,
  entityType 
}: MessageBubbleProps) => {
  
  // Generate dynamic prompts using ContextBuilder
  const getDynamicPrompts = () => {
    return ContextBuilder.generateDynamicPrompts(entity, entityType);
  };

  return (
    <div className="space-y-2">
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`w-full rounded-lg p-3 relative ${
            message.role === "user"
              ? "bg-slate-800 text-white"
              : "bg-muted"
          }`}
        >
          {/* Copy button in top right for assistant messages */}
          {message.role === "assistant" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(message.content)}
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          
          {message.role === "assistant" ? (
            <div className="text-sm prose prose-sm max-w-none dark:prose-invert pr-8">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          {message.timestamp && (
            <p className="text-xs opacity-70 mt-1">
              {format(new Date(message.timestamp), "h:mm a")}
            </p>
          )}
        </div>
      </div>
      
      {message.role === "assistant" && (
        <div className="space-y-2">
          {/* Dynamic suggested prompts with horizontal scrolling */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {getDynamicPrompts().map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs whitespace-nowrap flex-shrink-0"
                onClick={() => onSendPrompt?.(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
          
          {/* Action buttons (excluding copy which is now in top right) */}
          <div className="flex gap-2 justify-end">
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="h-8 px-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback("citations")}
              className="h-8 px-2"
            >
              <BookOpen className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
