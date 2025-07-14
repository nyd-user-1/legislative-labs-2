
import { useState, useEffect } from "react";
import { ProblemCard } from "./ProblemCard";
import { supabase } from "@/integrations/supabase/client";
import { AIChatSheet } from "@/components/AIChatSheet";
import { useToast } from "@/hooks/use-toast";

interface ProblemChat {
  id: string;
  problem_number: string;
  title: string;
  problem_statement: string;
  current_state: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ProblemsGridProps {
  problemChats: ProblemChat[];
  onProblemSelect: (problemChat: ProblemChat) => void;
  onRefresh?: () => void;
}

export const ProblemsGrid = ({ problemChats, onProblemSelect, onRefresh }: ProblemsGridProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedProblemForChat, setSelectedProblemForChat] = useState<ProblemChat | null>(null);
  const [problemsWithAIChat, setProblemsWithAIChat] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch problems that have AI chat sessions
  useEffect(() => {
    const fetchProblemsWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("id")
          .not("id", "is", null);

        if (sessions) {
          // Get problem chats that have associated chat sessions
          const { data: problemsWithChat } = await supabase
            .from("problem_chats")
            .select("id")
            .not("chat_session_id", "is", null);

          if (problemsWithChat) {
            const problemIdsWithChat = new Set(
              problemsWithChat.map(problem => problem.id)
            );
            setProblemsWithAIChat(problemIdsWithChat);
          }
        }
      } catch (error) {
        console.error("Error fetching AI chat sessions:", error);
      }
    };

    fetchProblemsWithAIChat();
  }, []);

  const handleAIAnalysis = (problemChat: ProblemChat, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProblemForChat(problemChat);
    setChatOpen(true);
    
    // Add this problem to the set of problems with AI chat
    setProblemsWithAIChat(prev => new Set([...prev, problemChat.id]));
  };

  const handleStateChange = async (problemChat: ProblemChat, newState: string) => {
    try {
      const { error } = await supabase
        .from("problem_chats")
        .update({ current_state: newState })
        .eq("id", problemChat.id);

      if (error) {
        console.error("Error updating problem state:", error);
        toast({
          title: "Error updating state",
          description: "Failed to update problem state. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "State updated",
        description: `Problem state changed to ${newState}`,
      });

      // Refresh the data if callback provided
      onRefresh?.();
    } catch (error) {
      console.error("Error updating problem state:", error);
      toast({
        title: "Error updating state",
        description: "Failed to update problem state. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Create a problem object for the chat sheet
  const problemObject = selectedProblemForChat ? {
    id: selectedProblemForChat.id,
    title: selectedProblemForChat.title,
    description: selectedProblemForChat.problem_statement,
    originalStatement: selectedProblemForChat.problem_statement
  } : null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problemChats.map((problemChat) => (
          <ProblemCard
            key={problemChat.id}
            problemChat={problemChat}
            onProblemSelect={onProblemSelect}
            onStateChange={handleStateChange}
            onAIAnalysis={handleAIAnalysis}
            hasAIChat={problemsWithAIChat.has(problemChat.id)}
          />
        ))}
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        problem={problemObject}
      />
    </>
  );
};
