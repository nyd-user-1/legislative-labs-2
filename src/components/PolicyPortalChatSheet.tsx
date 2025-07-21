import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { CitationsDrawer } from "./CitationsDrawer";
import { SuggestedPrompts } from "./chat/SuggestedPrompts";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatInput } from "./chat/ChatInput";
import { ChatContainer } from "./chat/ChatContainer";
import { ChatHeader } from "./chat/ChatHeader";
import { useChatLogic } from "@/hooks/useChatLogic";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";

interface PolicyPortalChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  systemPrompt?: string;
  selectedPersona?: string;
}

export const PolicyPortalChatSheet = ({ 
  open, 
  onOpenChange, 
  initialPrompt = "",
  systemPrompt = "",
  selectedPersona = ""
}: PolicyPortalChatSheetProps) => {
  const [citationsOpen, setCitationsOpen] = useState(false);
  const { toast } = useToast();
  
  // Use ref to track if we've already initialized this session
  const hasInitialized = useRef(false);
  
  // For Policy Portal, we use a 'problem' entity type for consistency
  const entity = { prompt: initialPrompt, systemPrompt, selectedPersona };
  const entityType = 'problem' as const;
  
  const {
    inputValue,
    setInputValue,
    isLoading,
    messages,
    citations,
    sendMessage,
    handleShareChat,
    getTitle,
    initializeSession
  } = useChatLogic(entity, entityType);

  // Initialize session when sheet opens (only once per entity)
  useEffect(() => {
    if (open && !hasInitialized.current) {
      console.log("Policy Portal chat sheet opened, initializing session");
      hasInitialized.current = true;
      
      // If there's an initial prompt, start with it
      if (initialPrompt.trim()) {
        initializeSession(false);
        // Small delay to ensure session is ready, then send initial message
        setTimeout(() => {
          sendMessage(initialPrompt);
        }, 100);
      } else {
        initializeSession(true);
      }
    }
    
    // Reset when sheet closes
    if (!open) {
      hasInitialized.current = false;
    }
  }, [open, initialPrompt, initializeSession, sendMessage]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      console.log("Handling send message:", inputValue);
      sendMessage(inputValue);
      setInputValue(""); // Clear input immediately after sending
    }
  };

  const handlePromptClick = (prompt: string) => {
    console.log("Handling prompt click:", prompt);
    sendMessage(prompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard.",
    });
  };

  const handleFeedback = (type: "thumbs-up" | "thumbs-down" | "citations") => {
    if (type === "citations") {
      setCitationsOpen(true);
    } else {
      toast({
        title: "Feedback received",
        description: `Thank you for your ${type} feedback!`,
      });
    }
  };

  // Custom title with Goodable branding
  const getChatTitle = () => {
    return (
      <div className="flex items-center gap-2">
        <MorphingHeartLoader size={20} className="text-red-500" />
        <span>Goodable</span>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <MorphingHeartLoader size={20} className="text-red-500" />
            <span>Goodable</span>
          </SheetTitle>
        </SheetHeader>

        <ChatContainer>
          {/* Dynamic Suggested Prompts */}
          <SuggestedPrompts
            entity={entity}
            entityType={entityType}
            onPromptClick={handlePromptClick}
            isLoading={isLoading}
            showPrompts={messages.length === 0}
            hasMessages={messages.length > 0}
          />

          {/* Chat Messages */}
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            onCopy={handleCopy}
            onShare={handleShareChat}
            onSendPrompt={sendMessage}
            entity={entity}
            entityType={entityType}
            onFeedback={handleFeedback}
          />

          {/* Input Area */}
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask about policy development..."
          />
        </ChatContainer>
      </SheetContent>
      
      <CitationsDrawer 
        open={citationsOpen}
        onOpenChange={setCitationsOpen}
        citations={citations}
      />
    </Sheet>
  );
};