
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
  isFirstAssistantMessage?: boolean;
}

export const MessageBubble = ({ 
  message, 
  onCopy, 
  onFeedback, 
  onShare, 
  onSendPrompt,
  entity,
  entityType,
  isFirstAssistantMessage = false
}: MessageBubbleProps) => {
  
  // Generate dynamic prompts based on AI content for subsequent messages
  const getDynamicPrompts = () => {
    if (isFirstAssistantMessage) {
      return ContextBuilder.generateDynamicPrompts(entity, entityType);
    }
    
    // For subsequent messages, generate prompts based on the AI response content
    return generateResponseBasedPrompts(message.content);
  };
  
  // Generate prompts based on AI response content
  const generateResponseBasedPrompts = (content: string): string[] => {
    const prompts = [];
    
    // Extract key topics from the AI response
    if (content.toLowerCase().includes('bill') || content.toLowerCase().includes('legislation')) {
      prompts.push("Show me similar bills");
      prompts.push("What's the voting record?");
    }
    
    if (content.toLowerCase().includes('committee') || content.toLowerCase().includes('hearing')) {
      prompts.push("Committee schedule");
      prompts.push("Meeting minutes");
    }
    
    if (content.toLowerCase().includes('sponsor') || content.toLowerCase().includes('author')) {
      prompts.push("Sponsor background");
      prompts.push("Other bills by sponsor");
    }
    
    if (content.toLowerCase().includes('impact') || content.toLowerCase().includes('effect')) {
      prompts.push("Economic impact");
      prompts.push("Implementation timeline");
    }
    
    if (content.toLowerCase().includes('vote') || content.toLowerCase().includes('voting')) {
      prompts.push("Voting history");
      prompts.push("Party positions");
    }
    
    // Add some generic follow-up prompts if we didn't find specific topics
    if (prompts.length === 0) {
      prompts.push("Tell me more");
      prompts.push("What are the details?");
      prompts.push("How does this work?");
    }
    
    // Always add these common follow-ups
    prompts.push("Sources and citations");
    prompts.push("Related information");
    
    return prompts.slice(0, 6); // Limit to 6 prompts
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
            <div className="text-sm prose prose-sm max-w-none dark:prose-invert pr-8 pb-8">
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
          
          {/* Share button in bottom right for assistant messages */}
          {message.role === "assistant" && onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="absolute bottom-2 right-2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
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
          
          {/* Action buttons (only citations, share moved to bottom right of message) */}
          <div className="flex gap-2 justify-end">
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
