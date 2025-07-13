import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, BookOpen } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down" | "citations") => void;
  onShare?: () => void;
  onSendPrompt?: (prompt: string) => void;
}

export const MessageBubble = ({ message, onCopy, onFeedback, onShare, onSendPrompt }: MessageBubbleProps) => {
  // Generate dynamic prompts based on message content
  const generateDynamicPrompts = (content: string) => {
    const prompts = [];
    const lowerContent = content.toLowerCase();
    
    // Base prompts that always appear
    if (lowerContent.includes('bill') || lowerContent.includes('legislation')) {
      prompts.push('Fiscal Impact', 'Similar Bills');
    } else if (lowerContent.includes('member') || lowerContent.includes('legislator')) {
      prompts.push('Voting Record', 'Committee Work');
    } else if (lowerContent.includes('committee')) {
      prompts.push('Meeting Schedule', 'Active Bills');
    } else {
      // Default prompts
      prompts.push('More Details', 'Related Topics');
    }
    
    // Add a third contextual prompt if space allows
    if (lowerContent.includes('vote') || lowerContent.includes('voting')) {
      prompts.push('Vote Analysis');
    } else if (lowerContent.includes('sponsor') || lowerContent.includes('author')) {
      prompts.push('Sponsor History');
    } else if (lowerContent.includes('impact') || lowerContent.includes('effect')) {
      prompts.push('Stakeholder Views');
    }
    
    // Return only first 2-3 prompts that fit in one line
    return prompts.slice(0, 3);
  };
  return (
    <div className="space-y-2">
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`w-full rounded-lg p-3 ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {message.role === "assistant" ? (
            <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
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
          {/* Suggested prompts */}
          <div className="flex flex-wrap gap-2">
            {generateDynamicPrompts(message.content).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs whitespace-nowrap"
                onClick={() => onSendPrompt?.(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(message.content)}
              className="h-8 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
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