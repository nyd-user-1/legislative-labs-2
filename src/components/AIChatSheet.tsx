
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
import { CitationsDrawer } from "./CitationsDrawer";
import { ContextBuilder, EntityContext } from "@/utils/contextBuilder";

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
  const [citationsOpen, setCitationsOpen] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { selectedModel, setSelectedModel } = useModel();
  
  // Determine the entity ID and type for the chat session
  const entityId = bill?.bill_id || member?.people_id || committee?.committee_id || null;
  const entityType = bill ? 'bill' : member ? 'member' : committee ? 'committee' : null;
  const entity = bill || member || committee || null;
  
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

      // Build enhanced context using ContextBuilder
      const enhancedPrompt = ContextBuilder.buildPromptContext(entity, entityType, content);
      const entityContext = ContextBuilder.getEntityContext(entity, entityType);

      // Call enhanced OpenAI edge function
      const { data: responseData, error: functionError } = await supabase.functions.invoke('generate-with-openai', {
        body: {
          prompt: enhancedPrompt,
          model: selectedModel,
          type: 'default',
          entityContext: entityContext,
          enhanceWithNYSData: true
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to get AI response");
      }

      if (!responseData?.generatedText) {
        throw new Error("No response received from AI");
      }

      // Handle citations if NYS data was used
      if (responseData.nysDataUsed && responseData.searchResults) {
        const newCitations = [];
        
        if (responseData.searchResults.bills) {
          responseData.searchResults.bills.forEach((bill: any) => {
            newCitations.push({
              id: `bill-${bill.printNo || bill.basePrintNo}`,
              title: `${bill.printNo || bill.basePrintNo} - ${bill.title || 'NYS Bill'}`,
              source: "New York State Senate",
              url: `https://www.nysenate.gov/legislation/bills/${bill.session}/${bill.printNo || bill.basePrintNo}`,
              excerpt: `Status: ${bill.status?.statusDesc || 'Unknown'} | Sponsor: ${bill.sponsor?.member?.shortName || 'Unknown'}`
            });
          });
        }
        
        if (responseData.searchResults.members) {
          responseData.searchResults.members.forEach((member: any) => {
            newCitations.push({
              id: `member-${member.memberId}`,
              title: `${member.shortName} - NYS ${member.chamber}`,
              source: "New York State Legislature",
              excerpt: `District: ${member.districtCode || 'N/A'}`
            });
          });
        }
        
        setCitations(newCitations);
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

  // Generate dynamic suggested prompts
  const getSuggestedPrompts = () => {
    if (messages.length > 0) return []; // Hide after first message
    
    return ContextBuilder.generateDynamicPrompts(entity, entityType);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{getTitle()}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Dynamic Suggested Prompts */}
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
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => {
                // Convert Date to string for MessageBubble compatibility
                const chatMessage: ChatMessage = {
                  ...message,
                  timestamp: message.timestamp.toISOString()
                };
                
                return (
                  <MessageBubble 
                    key={message.id}
                    message={chatMessage}
                    onCopy={(text) => {
                      navigator.clipboard.writeText(text);
                      toast({
                        title: "Copied to clipboard",
                        description: "Message content copied to clipboard.",
                      });
                    }}
                    onFeedback={(type) => {
                      if (type === "citations") {
                        setCitationsOpen(true);
                      } else {
                        toast({
                          title: "Feedback received",
                          description: `Thank you for your ${type} feedback!`,
                        });
                      }
                    }}
                    onShare={handleShareChat}
                    onSendPrompt={(prompt) => sendMessage(prompt)}
                    entity={entity}
                    entityType={entityType}
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
      
      <CitationsDrawer 
        open={citationsOpen}
        onOpenChange={setCitationsOpen}
        citations={citations}
      />
    </Sheet>
  );
};
