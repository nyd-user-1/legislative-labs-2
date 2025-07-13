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
}

export const MessageBubble = ({ message, onCopy, onFeedback, onShare }: MessageBubbleProps) => {
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
        <div className="flex justify-between items-center gap-2">
          {/* Suggested prompts on the left */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onCopy("Fiscal Impact")}
            >
              Fiscal Impact
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onCopy("Similar Bills")}
            >
              Similar Bills
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onCopy("Likely Supporters")}
            >
              Likely Supporters
            </Button>
          </div>
          
          {/* Action buttons on the right */}
          <div className="flex gap-2">
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