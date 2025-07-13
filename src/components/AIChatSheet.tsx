
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
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatSession } from "@/hooks/useChatSession";
import { MessageBubble } from "@/pages/chats/components/MessageBubble";
import { Message as ChatMessage } from "@/pages/chats/types";

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
  member?: Member | null;
  committee?: Committee | null;
}

const SUGGESTED_PROMPTS = {
  bill: [
    "Analyze key provisions & impact",
    "Arguments for & against?",
    "Compare to similar state bills",
    "What are fiscal implications?"
  ],
  member: [
    "Key policy positions?",
    "Voting record & committees",
    "Recent sponsored legislation",
    "Party alignment analysis"
  ],
  committee: [
    "What legislation do they handle?",
    "Recent activity & priorities",
    "Who are key members?",
    "Major bills reviewed recently?"
  ]
};

export const AIChatSheet = ({ open, onOpenChange, bill, member, committee }: AIChatSheetProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionCreated, setIsSessionCreated] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { selectedModel, setSelectedModel } = useModel();
  
  // Determine the entity ID and type for the chat session
  const entityId = bill?.bill_id || member?.people_id || committee?.committee_id || null;
  const entityType = bill ? 'bill' : member ? 'member' : committee ? 'committee' : null;
  
  const {
    messages,
    sessionId,
    saveMessage,
    createNewSession,
    updateSession
  } = useChatSession(entityId);

  // Get the appropriate title and suggested prompts
  const getTitle = () => {
    if (bill) return `Analysis: ${bill.bill_number || "Unknown Bill"}`;
    if (member) return `Chat about ${member.name}`;
    if (committee) return `Chat about ${committee.name}`;
    return "AI Legislative Analysis";
  };

  const getDescription = () => {
    if (bill) return `Analyzing ${bill.bill_number || "Bill"}`;
    if (member) return `Discussing ${member.name}`;
    if (committee) return `Discussing ${committee.name}`;
    return "Chat with AI about legislation";
  };

  const getSuggestedPrompts = () => {
    if (bill) return SUGGESTED_PROMPTS.bill;
    if (member) return SUGGESTED_PROMPTS.member;
    if (committee) return SUGGESTED_PROMPTS.committee;
    return SUGGESTED_PROMPTS.bill;
  };

  useEffect(() => {
    if (open && (bill || member || committee) && !isSessionCreated) {
      // Automatically create session when AI chat is opened
      const sessionTitle = getTitle();
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
  }, [open, bill, member, committee, isSessionCreated, createNewSession, toast]);

  // Update the session whenever messages change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      updateSession(messages);
    }
  }, [messages, sessionId, updateSession]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
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

      // Scroll to bottom after user message
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);

      // Prepare context based on the entity type
      let contextInfo = "";
      if (bill) {
        contextInfo = `
        Bill Information:
        - Number: ${bill.bill_number || "Unknown"}
        - Title: ${bill.title || "No title"}
        - Status: ${bill.status_desc || "Unknown"}
        - Last Action: ${bill.last_action || "None"}
        - Committee: ${bill.committee || "Unknown"}
        `;
      } else if (member) {
        contextInfo = `
        Member Information:
        - Name: ${member.name}
        - Party: ${member.party || "Unknown"}
        - District: ${member.district || "Unknown"}
        - Chamber: ${member.chamber || "Unknown"}
        `;
      } else if (committee) {
        contextInfo = `
        Committee Information:
        - Name: ${committee.name}
        - Chamber: ${committee.chamber}
        - Description: ${committee.description || "No description available"}
        `;
      }

      const fullPrompt = `${contextInfo}
        
        User Question: ${content}`;

      // Create assistant message placeholder for streaming
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date()
      };
      
      saveMessage(assistantMessage);

      try {
        // Call OpenAI edge function with streaming
        const { data: responseData, error: functionError } = await supabase.functions.invoke('generate-with-openai', {
          body: {
            prompt: fullPrompt,
            model: selectedModel,
            type: 'default',
            stream: true
          }
        });

        if (functionError) {
          throw new Error(functionError.message || "Failed to get AI response");
        }

        // If we get a complete response (fallback for non-streaming)
        if (responseData?.generatedText) {
          const updatedMessage: Message = {
            ...assistantMessage,
            content: responseData.generatedText
          };
          saveMessage(updatedMessage);
        }
        
      } catch (streamError) {
        console.warn("Streaming failed, falling back to non-streaming:", streamError);
        
        // Fallback to non-streaming
        const { data: responseData, error: functionError } = await supabase.functions.invoke('generate-with-openai', {
          body: {
            prompt: fullPrompt,
            model: selectedModel,
            type: 'default',
            stream: false
          }
        });

        if (functionError) {
          throw new Error(functionError.message || "Failed to get AI response");
        }

        if (!responseData?.generatedText) {
          throw new Error("No response received from AI");
        }
        
        // Update the assistant message with complete response
        const updatedMessage: Message = {
          ...assistantMessage,
          content: responseData.generatedText
        };
        
        saveMessage(updatedMessage);
      }
      
      // Scroll to bottom after AI response
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);
      
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
        title: getTitle(),
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
          <SheetTitle>{getTitle()}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Suggested prompts:</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {getSuggestedPrompts().map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-3 px-4 text-left whitespace-normal min-w-[160px] max-w-[180px] flex-shrink-0 leading-tight text-sm"
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
          <div className="flex-1 relative">
            {/* Top blur gradient */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/80 to-transparent z-10 pointer-events-none" />
            
            <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
              <div className="space-y-4 py-2">
                {messages.map((message, index) => {
                  // Convert Date to string for MessageBubble compatibility
                  const chatMessage: ChatMessage = {
                    ...message,
                    timestamp: message.timestamp.toISOString()
                  };
                  
                  // Generate suggested prompts for assistant messages
                  const suggestedPrompts = getSuggestedPrompts();
                  const suggestedPrompt = message.role === "assistant" && index === messages.length - 1 
                    ? suggestedPrompts[Math.floor(Math.random() * suggestedPrompts.length)]
                    : undefined;
                  
                  // Mock citations for demonstration
                  const mockCitations = message.role === "assistant" ? [
                    {
                      id: "1",
                      title: "New York State Legislature",
                      url: "https://www.nysenate.gov",
                      source: "NY Senate",
                      excerpt: "Official legislative information and bill tracking"
                    },
                    {
                      id: "2", 
                      title: "Legislative Database",
                      url: "https://legislation.nysenate.gov",
                      source: "OpenLegislation",
                      excerpt: "Comprehensive database of NY legislative actions"
                    }
                  ] : [];
                  
                  return (
                    <MessageBubble 
                      key={message.id}
                      message={chatMessage}
                      citations={mockCitations}
                      suggestedPrompt={suggestedPrompt}
                      onPromptClick={handlePromptClick}
                      onCopy={(text) => {
                        navigator.clipboard.writeText(text);
                        toast({
                          title: "Copied to clipboard",
                          description: "Message content copied to clipboard.",
                        });
                      }}
                      onFeedback={(type) => {
                        toast({
                          title: "Feedback received",
                          description: `Thank you for your ${type} feedback!`,
                        });
                      }}
                      onShare={handleShareChat}
                    />
                  );
                })}
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-start">
                      <div className="w-full rounded-lg p-3 bg-muted">
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
            
            {/* Bottom blur gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/80 to-transparent z-10 pointer-events-none" />
          </div>

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

          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
