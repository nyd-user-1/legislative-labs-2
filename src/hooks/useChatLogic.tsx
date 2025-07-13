
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";
import { useToast } from "@/hooks/use-toast";
import { useChatSession } from "@/hooks/useChatSession";
import { ContextBuilder } from "@/utils/contextBuilder";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type Entity = any;
type EntityType = 'bill' | 'member' | 'committee' | null;

export const useChatLogic = (entity: Entity, entityType: EntityType) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);
  const { toast } = useToast();
  const { selectedModel } = useModel();
  
  // Use ref to track if we're already creating a session
  const isCreatingSession = useRef(false);
  
  // Determine the entity ID for the chat session
  const entityId = entity?.bill_id || entity?.people_id || entity?.committee_id || null;
  
  const {
    messages,
    sessionId,
    saveMessage,
    createNewSession,
    updateSession
  } = useChatSession(entityId);

  // Get the appropriate title
  const getTitle = () => {
    if (entityType === 'bill' && entity) return `Analysis: ${entity.bill_number || "Unknown Bill"}`;
    if (entityType === 'member' && entity) return `Chat about ${entity.name}`;
    if (entityType === 'committee' && entity) return `Chat about ${entity.name}`;
    return "AI Legislative Analysis";
  };

  // Initialize session only once when chat opens
  const initializeSession = useCallback(async (isOpen: boolean) => {
    // Only initialize if chat is open, we have an entity, no existing session, and we're not already creating one
    if (isOpen && entity && !sessionId && !isCreatingSession.current) {
      try {
        console.log("Initializing new chat session for:", getTitle());
        isCreatingSession.current = true;
        const sessionTitle = getTitle();
        await createNewSession(sessionTitle);
        console.log("Session created successfully");
      } catch (error) {
        console.error("Failed to create session:", error);
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
      } finally {
        isCreatingSession.current = false;
      }
    }
  }, [entity, sessionId, createNewSession, toast]);

  // Update the session when messages change (but avoid infinite loops)
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      console.log("Updating session with", messages.length, "messages");
      updateSession(messages);
    }
  }, [messages.length, sessionId]); // Only trigger when message count changes

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) {
      console.log("Message sending blocked - empty content or already loading");
      return;
    }

    console.log("Sending message:", content);
    setIsLoading(true);
    
    try {
      // Add user message immediately
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

      console.log("Calling AI function with enhanced prompt");
      
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
        console.error("Function error:", functionError);
        throw new Error(functionError.message || "Failed to get AI response");
      }

      if (!responseData?.generatedText) {
        console.error("No generated text in response:", responseData);
        throw new Error("No response received from AI");
      }

      console.log("AI response received, length:", responseData.generatedText.length);

      // Always include baseline citations plus any NYS data
      const newCitations = [];
      
      // Add baseline citation for current entity
      if (entity && entityType) {
        if (entityType === 'bill') {
          // Add link to bill detail page on our website
          newCitations.push({
            id: `our-bill-${entity.bill_id}`,
            title: `${entity.bill_number || 'Bill'} - Legislative Analysis`,
            source: "NYS Legislative Tracker",
            url: `${window.location.origin}/bills/${entity.bill_id}`,
            excerpt: `${entity.title || 'New York State bill analysis and tracking'}`
          });
          
          // Add link to official NYS bill page if bill number exists
          if (entity.bill_number) {
            const billNumber = entity.bill_number.replace(/\s+/g, '');
            newCitations.push({
              id: `nys-bill-${entity.bill_number}`,
              title: `${entity.bill_number} - Official NYS Page`,
              source: entity.bill_number.startsWith('S') ? "New York State Senate" : "New York State Assembly",
              url: entity.bill_number.startsWith('S') 
                ? `https://www.nysenate.gov/legislation/bills/2023/${billNumber}`
                : `https://nyassembly.gov/leg/?default_fld=&leg_video=&bn=${billNumber}&term=2023`,
              excerpt: `Official legislative page for ${entity.bill_number}`
            });
          }
        } else if (entityType === 'member') {
          newCitations.push({
            id: `our-member-${entity.people_id}`,
            title: `${entity.name} - Member Profile`,
            source: "NYS Legislative Tracker",
            url: `${window.location.origin}/members/${entity.people_id}`,
            excerpt: `Profile and legislative activity for ${entity.name}`
          });
        } else if (entityType === 'committee') {
          newCitations.push({
            id: `our-committee-${entity.committee_id}`,
            title: `${entity.name} - Committee Profile`,
            source: "NYS Legislative Tracker", 
            url: `${window.location.origin}/committees/${entity.committee_id}`,
            excerpt: `Committee information and current agenda`
          });
        }
      }
      
      // Add citations from NYS search results if available
      if (responseData.nysDataUsed && responseData.searchResults) {
        if (responseData.searchResults.bills) {
          responseData.searchResults.bills.forEach((bill: any) => {
            newCitations.push({
              id: `nys-search-bill-${bill.printNo || bill.basePrintNo}`,
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
              id: `nys-search-member-${member.memberId}`,
              title: `${member.shortName} - NYS ${member.chamber}`,
              source: "New York State Legislature",
              excerpt: `District: ${member.districtCode || 'N/A'}`
            });
          });
        }
      }
      
      setCitations(newCitations);
      
      // Add AI response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseData.generatedText,
        timestamp: new Date()
      };
      
      console.log("Saving assistant message");
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

  return {
    inputValue,
    setInputValue,
    isLoading,
    messages,
    citations,
    sendMessage,
    handleShareChat,
    getTitle,
    initializeSession
  };
};
