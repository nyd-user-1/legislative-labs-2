import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, ExternalLink, Globe, FileText } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Citation {
  id: string;
  title: string;
  url: string;
  source: string;
  excerpt?: string;
}

interface MessageBubbleProps {
  message: Message;
  onCopy: (text: string) => void;
  onFeedback: (type: "thumbs-up" | "thumbs-down") => void;
  onShare?: () => void;
  citations?: Citation[];
  suggestedPrompt?: string;
  onPromptClick?: (prompt: string) => void;
}

export const MessageBubble = ({ 
  message, 
  onCopy, 
  onFeedback, 
  onShare, 
  citations = [], 
  suggestedPrompt,
  onPromptClick 
}: MessageBubbleProps) => {
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
              
              {/* Citations */}
              {citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/40">
                  <div className="flex flex-wrap gap-2">
                    {citations.map((citation, index) => (
                      <Drawer key={citation.id}>
                        <DrawerTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-muted"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            {index + 1}
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle className="text-left">{citation.title}</DrawerTitle>
                            <DrawerDescription className="text-left">
                              From {citation.source}
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="px-4 pb-4">
                            {citation.excerpt && (
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground">{citation.excerpt}</p>
                              </div>
                            )}
                            <Button
                              onClick={() => window.open(citation.url, '_blank')}
                              className="w-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Source
                            </Button>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    ))}
                  </div>
                </div>
              )}
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
        <div className="flex justify-between items-center">
          {/* Suggested Prompt */}
          {suggestedPrompt && onPromptClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPromptClick(suggestedPrompt)}
              className="text-xs max-w-xs truncate"
            >
              {suggestedPrompt}
            </Button>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
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
              onClick={() => onFeedback("thumbs-up")}
              className="h-8 px-2"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback("thumbs-down")}
              className="h-8 px-2"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};