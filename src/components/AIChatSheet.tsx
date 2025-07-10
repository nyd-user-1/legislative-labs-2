
import { useState, useRef, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatSession } from "@/hooks/useChatSession";
import { ModelSelector } from "@/components/ModelSelector";

type Bill = Tables<"Bills">;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
}

const SUGGESTED_PROMPTS = [
  "Analyze this bill's key provisions and potential impact",
  "What are the main arguments for and against this legislation?"
];

export const AIChatSheet = ({ open, onOpenChange, bill }: AIChatSheetProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionCreated, setIsSessionCreated] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { selectedModel, setSelectedModel } = useModel();
  
  const {
    messages,
    sessionId,
    saveMessage,
    createNewSession,
    updateSession
  } = useChatSession(bill?.bill_id || null);

  useEffect(() => {
    if (open && bill && !isSessionCreated) {
      // Automatically create session when AI chat is opened
      const sessionTitle = `Analysis: ${bill.bill_number || "Unknown Bill"}`;
      createNewSession(sessionTitle).then(() => {
        setIsSessionCreated(true);
      }).catch((error) => {
        console.error("Failed to create session:", error);
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
      });
    }
    
    // Reset session created flag when sheet closes
    if (!open) {
      setIsSessionCreated(false);
    }
  }, [open, bill, isSessionCreated, createNewSession, toast]);

  // Update the session whenever messages change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      updateSession(messages);
    }
  }, [messages, sessionId, updateSession]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date()
      };
      
      saveMessage(userMessage);

      // Prepare context about the bill
      const billContext = bill ? `
        Bill Information:
        - Number: ${bill.bill_number || "Unknown"}
        - Title: ${bill.title || "No title"}
        - Status: ${bill.status_desc || "Unknown"}
        - Last Action: ${bill.last_action || "None"}
        - Committee: ${bill.committee || "Unknown"}
        
        User Question: ${content}
      ` : content;

      // Call OpenAI edge function using Supabase client
      const { data: responseData, error: functionError } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt: billContext,
          model: selectedModel,
          type: 'default'
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to get AI response");
      }

      if (!responseData?.generatedText) {
        throw new Error("No response received from AI");
      }
      
      // Add AI response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseData.generatedText,
        timestamp: new Date()
      };
      
      saveMessage(assistantMessage);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setInputValue("");
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputValue);
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleShareChat = async () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to share",
        description: "Start a conversation first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a shareable text version of the chat
      const chatText = messages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
      ).join('\n\n');
      
      const shareData = {
        title: `AI Chat Analysis - ${bill?.bill_number || 'Legislative Discussion'}`,
        text: chatText,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(chatText);
        toast({
          title: "Chat copied to clipboard",
          description: "The conversation has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing chat:", error);
      toast({
        title: "Error sharing chat",
        description: "Failed to share the conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>AI Legislative Analysis</SheetTitle>
          <SheetDescription>
            {bill ? `Analyzing ${bill.bill_number || "Bill"}` : "Chat with AI about legislation"}
          </SheetDescription>
          <div className="pt-2">
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Suggested prompts:</h4>
              <div className="grid gap-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 text-left whitespace-normal"
                    onClick={() => handlePromptClick(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 ${
                    message.role === "user" ? "flex justify-end" : "flex justify-start"
                  }`}
                >
                  <Card className={`w-full ${message.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
                    <CardContent className="p-3">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="px-4 flex justify-start">
                  <Card className="w-full">
                    <CardContent className="p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 space-y-3">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this legislation..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                onClick={handleShareChat}
                disabled={messages.length === 0}
                className="flex items-center gap-2"
              >
                <Share className="w-4 h-4" />
                Share Chat
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
