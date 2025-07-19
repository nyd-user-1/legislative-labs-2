
import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { generateProblemFromScenario } from "@/utils/problemStatementHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

interface ProblemChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProblem: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ProblemChatSheet = ({ open, onOpenChange, userProblem }: ProblemChatSheetProps) => {
  const [aiProblemStatement, setAiProblemStatement] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [chatTitle, setChatTitle] = useState('Problem 1');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const streamingRef = useRef<string>('');

  // Generate sequential problem number
  const generateProblemNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('problem_chats')
        .select('problem_number')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].problem_number.replace('P', ''));
        return `P${(lastNumber + 1).toString().padStart(5, '0')}`;
      }
      return 'P00001';
    } catch (error) {
      console.error('Error generating problem number:', error);
      return `P${Date.now().toString().slice(-5)}`;
    }
  };

  // Start streaming when sheet opens
  useEffect(() => {
    if (open && userProblem && !isStreaming && !aiProblemStatement) {
      startStreaming();
    }
  }, [open, userProblem]);

  // Initialize messages when AI problem statement is generated
  useEffect(() => {
    if (isComplete && aiProblemStatement && messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: 'user-1',
          role: 'user',
          content: userProblem,
          timestamp: new Date()
        },
        {
          id: 'assistant-1',
          role: 'assistant',
          content: aiProblemStatement,
          timestamp: new Date()
        }
      ];
      setMessages(initialMessages);
    }
  }, [isComplete, aiProblemStatement, userProblem, messages.length]);

  const startStreaming = async () => {
    if (!userProblem || !user) return;

    setIsStreaming(true);
    setIsComplete(false);
    streamingRef.current = '';
    setAiProblemStatement('');

    try {
      // Generate initial problem number and create chat session
      const problemNumber = await generateProblemNumber();
      setChatTitle(problemNumber);

      // Create chat session
      const { data: sessionData, error: sessionError } = await supabase
        .from('problem_chats')
        .insert({
          user_id: user.id,
          problem_number: problemNumber,
          title: problemNumber,
          problem_statement: userProblem,
          current_state: 'generating'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setChatSessionId(sessionData.id);

      const response = await fetch(
        `https://kwyjohornlgujoqypyvu.supabase.co/functions/v1/generate-with-openai`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eWpvaG9ybmxndWpvcXlweXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTAyODcsImV4cCI6MjA2NzE4NjI4N30.nPewQZse07MkYAK5W9wCEwYhnndHkA8pKmedgHkvD9M`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: userProblem,
            type: 'problem',
            context: 'landing_page',
            stream: true
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate problem statement');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  const content = data.choices[0].delta.content;
                  streamingRef.current += content;
                  setAiProblemStatement(streamingRef.current);
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      setIsComplete(true);
      setIsStreaming(false);

      // Update chat session with final content
      if (sessionData?.id) {
        await supabase
          .from('problem_chats')
          .update({
            current_state: streamingRef.current,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionData.id);
      }

      // Generate suggested prompts and dynamic title
      generateSuggestedPrompts(streamingRef.current);
      generateDynamicTitle(streamingRef.current, sessionData?.id);

    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
      toast({
        title: "Error",
        description: "Failed to generate problem statement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateSuggestedPrompts = (content: string) => {
    // Extract keywords and generate 3-4 dynamic prompts based on content
    const prompts = [];
    
    if (content.toLowerCase().includes('fiscal') || content.toLowerCase().includes('cost') || content.toLowerCase().includes('budget')) {
      prompts.push('Fiscal Impact');
    }
    if (content.toLowerCase().includes('social') || content.toLowerCase().includes('community')) {
      prompts.push('Social Impact');
    }
    if (content.toLowerCase().includes('cause') || content.toLowerCase().includes('reason')) {
      prompts.push('Root Cause');
    }
    if (content.toLowerCase().includes('effect') || content.toLowerCase().includes('consequence')) {
      prompts.push('Hidden Effects');
    }

    // Fallback prompts if none match
    if (prompts.length === 0) {
      prompts.push('Root Cause', 'Social Impact', 'Fiscal Impact');
    }

    setSuggestedPrompts(prompts.slice(0, 4)); // Maximum 4 prompts
  };

  const generateDynamicTitle = async (content: string, sessionId?: string) => {
    try {
      // Extract key terms from the AI response for a descriptive title
      const response = await fetch(
        `https://kwyjohornlgujoqypyvu.supabase.co/functions/v1/generate-with-openai`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eWpvaG9ybmxndWpvcXlweXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTAyODcsImV4cCI6MjA2NzE4NjI4N30.nPewQZse07MkYAK5W9wCEwYhnndHkA8pKmedgHkvD9M`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Create a short, descriptive title (3-5 words) for this problem analysis: ${content.substring(0, 200)}...`,
            type: 'default',
            model: 'gpt-4o-mini'
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let rawTitle = data.generatedText?.trim().replace(/['"]/g, '') || chatTitle;
        
        // Clean markdown from title
        const cleanTitle = rawTitle.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s*/g, '').trim();
        setChatTitle(cleanTitle);

        // Update the database with the clean title
        if (sessionId) {
          await supabase
            .from('problem_chats')
            .update({ title: cleanTitle })
            .eq('id', sessionId);
        }
      }
    } catch (error) {
      console.error('Error generating dynamic title:', error);
      // Keep the fallback title
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiProblemStatement);
    toast({
      title: "Copied to clipboard",
      description: "Problem statement copied to clipboard.",
    });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setInputValue(''); // Clear input immediately

    try {
      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { 
          prompt: message,
          type: 'chat',
          context: 'problem_chat',
          enhanceWithNYSData: true
        }
      });

      if (error) {
        console.error('Error calling OpenAI function:', error);
        throw new Error('Failed to generate response');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.generatedText || 'Unable to generate response. Please try again.',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Update chat session with new messages
      if (chatSessionId) {
        await supabase
          .from('problem_chats')
          .update({
            current_state: JSON.stringify(finalMessages),
            updated_at: new Date().toISOString()
          })
          .eq('id', chatSessionId);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    console.log("Handling prompt click:", prompt);
    sendMessage(prompt);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{chatTitle}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Display all messages */}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-3 max-w-[90%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted relative'
              }`}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
                
                {message.role === 'assistant' && message.id === 'assistant-1' && isComplete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator for new messages */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-3 max-w-[90%]">
                <div className="text-muted-foreground">Generating response...</div>
              </div>
            </div>
          )}

          {/* Suggested Prompts - Only show after initial completion and if no follow-up messages */}
          {isComplete && suggestedPrompts.length > 0 && messages.length <= 2 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Suggested prompts:</div>
              <div className="flex gap-2 flex-wrap">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="flex-shrink-0 border-t pt-4">
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isStreaming}
            placeholder="Ask a follow-up question..."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
