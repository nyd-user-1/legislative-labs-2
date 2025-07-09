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
import { Send, Save, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatSession } from "@/hooks/useChatSession";
import { ModelSelector } from "@/components/ModelSelector";
import { Skeleton } from "@/components/ui/skeleton";

type Bill = Tables<"Bills">;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
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
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { selectedModel, setSelectedModel } = useModel();
  
  const {
    messages,
    sessionId,
    saveMessage,
    saveSession,
    loadSession,
    createNewSession
  } = useChatSession(bill?.bill_id || null);

  useEffect(() => {
    if (open && bill) {
      // Try to load existing session or create new one
      const sessionTitle = `Analysis: ${bill.bill_number || "Unknown Bill"}`;
      createNewSession(sessionTitle);
    }
  }, [open, bill]);

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

      // Create streaming assistant message
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true
      };
      
      saveMessage(assistantMessage);
      setStreamingMessageId(assistantMessageId);

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

      // Call edge function with streaming
      const { data: responseData, error: functionError } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt: billContext,
          model: selectedModel,
          type: 'default',
          stream: true
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to get AI response");
      }

      // For now, handle non-streaming response
      // TODO: Implement actual streaming when the edge function supports it
      if (responseData?.generatedText) {
        // Simulate streaming by updating the message content gradually
        const fullText = responseData.generatedText;
        const words = fullText.split(' ');
        let currentContent = '';
        
        for (let i = 0; i < words.length; i++) {
          currentContent += (i > 0 ? ' ' : '') + words[i];
          
          // Update the streaming message
          const updatedMessage: Message = {
            ...assistantMessage,
            content: currentContent,
            isStreaming: i < words.length - 1
          };
          
          // Update the messages state by finding and replacing the streaming message
          setStreamingMessageId(i < words.length - 1 ? assistantMessageId : null);
          
          // Add delay to simulate streaming
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Final update - mark as complete
        const finalMessage: Message = {
          ...assistantMessage,
          content: fullText,
          isStreaming: false
        };
        
        saveMessage(finalMessage);
      } else {
        throw new Error("No response received from AI");
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      setInputValue("");
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputValue);
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSaveChat = async () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to save",
        description: "Start a conversation first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveSession();
      toast({
        title: "Chat saved",
        description: "Your conversation has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving chat",
        description: "Failed to save the conversation. Please try again.",
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
          <SheetTitle>{bill ? `Analyzing ${bill.bill_number || "Bill"}` : "AI Legislative Analysis"}</SheetTitle>
          <SheetDescription>
            {bill ? `${bill.title || "Legislative Analysis"}` : "Chat with AI about legislation"}
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
                  className={`flex w-full ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 w-full max-w-[95vw] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                    style={{ margin: "0 2rem" }}
                  >
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === "user" ? "bg-primary text-primary-foreground rounded-lg" : "bg-transparent"}`}>
                      <div className="p-3">
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                          {message.isStreaming && (
                            <div className="inline-flex items-center gap-1 ml-1">
                              <Skeleton className="h-4 w-12 inline-block" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && !streamingMessageId && (
                <div className="flex w-full justify-start" style={{ margin: "0 2rem" }}>
                  <div className="flex gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
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
                onClick={handleSaveChat}
                disabled={messages.length === 0}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Chat
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