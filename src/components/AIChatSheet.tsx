
import React, { useState, useEffect, useRef } from "react";
import { Tables } from "@/integrations/supabase/types";
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
import { useChatLogic } from "@/hooks/useChatLogic";

type Bill = Tables<"Bills">;
type Member = {
  people_id: number;
  name: string;
  party?: string;
  district?: string;
  chamber?: string;
};
type Committee = {
  committee_id: number;
  name: string;
  chamber: string;
  description?: string;
};
type Problem = {
  id: string;
  title: string;
  description: string;
  originalStatement: string;
  problemNumber?: string;
};

interface AIChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  member?: Member | null;
  committee?: Committee | null;
  problem?: Problem | null;
}

export const AIChatSheet = ({ open, onOpenChange, bill, member, committee, problem }: AIChatSheetProps) => {
  const [citationsOpen, setCitationsOpen] = useState(false);
  const { toast } = useToast();
  
  // Use ref to track if we've already initialized this session
  const hasInitialized = useRef(false);
  
  // Determine the entity and type for the chat session
  const entity = bill || member || committee || problem || null;
  const entityType = bill ? 'bill' : member ? 'member' : committee ? 'committee' : problem ? 'problem' : null;
  
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
    if (open && entity && !hasInitialized.current) {
      console.log("Chat sheet opened, initializing session");
      hasInitialized.current = true;
      initializeSession(true);
    }
    
    // Reset when sheet closes
    if (!open) {
      hasInitialized.current = false;
    }
  }, [open, entity, initializeSession]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      console.log("Handling send message:", inputValue);
      sendMessage(inputValue);
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

  // Get the appropriate title
  const getSheetTitle = () => {
    if (problem && problem.problemNumber) {
      return `Problem: ${problem.problemNumber}`;
    }
    return getTitle();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{getSheetTitle()}</SheetTitle>
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
