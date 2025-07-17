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
import { generateProblemFromScenario } from "@/utils/problemStatementHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

interface ProblemChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProblem: string;
}

export const ProblemChatSheet = ({ open, onOpenChange, userProblem }: ProblemChatSheetProps) => {
  const [aiProblemStatement, setAiProblemStatement] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [chatTitle, setChatTitle] = useState('Problem 1');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
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
        const title = data.generatedText?.trim().replace(/['"]/g, '') || chatTitle;
        setChatTitle(title);

        // Update the database with the new title
        if (sessionId) {
          await supabase
            .from('problem_chats')
            .update({ title })
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

  const handlePromptClick = (prompt: string) => {
    // For now, just show a toast. This could be extended to continue the conversation
    toast({
      title: "Prompt selected",
      description: `You selected: ${prompt}`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{chatTitle}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* User Problem Display */}
          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
              {userProblem}
            </div>
          </div>

          {/* AI Problem Statement */}
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 max-w-[90%] relative">
              {aiProblemStatement && (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{aiProblemStatement}</ReactMarkdown>
                </div>
              )}
              
              {isStreaming && !aiProblemStatement && (
                <div className="text-muted-foreground">Generating response...</div>
              )}

              {isComplete && aiProblemStatement && (
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

          {/* Suggested Prompts - Only show after completion */}
          {isComplete && suggestedPrompts.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Suggested prompts:</div>
              <div className="flex gap-2 flex-wrap">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
