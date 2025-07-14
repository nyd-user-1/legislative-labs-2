
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIChatSheet } from "../AIChatSheet";

interface ProblemChat {
  id: string;
  problem_number: string;
  title: string;
  problem_statement: string;
  current_state: string;
  created_at: string;
  user_id: string;
  chat_session_id: string | null;
}

export const ProblemChatsGrid = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProblem, setSelectedProblem] = useState<ProblemChat | null>(null);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);

  const { data: problemChats = [], isLoading, error } = useQuery({
    queryKey: ['problem-chats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('problem_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching problem chats:', error);
        throw error;
      }

      console.log('Fetched problem chats:', data);
      return data as ProblemChat[];
    }
  });

  // Set up real-time subscription to refresh data when new problem chats are added
  useEffect(() => {
    const channel = supabase
      .channel('problem-chats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'problem_chats'
        },
        () => {
          // Invalidate and refetch the problem chats query
          queryClient.invalidateQueries({ queryKey: ['problem-chats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleFavorite = (problemChat: ProblemChat, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Added to favorites",
      description: `Problem ${problemChat.problem_number} has been favorited.`,
    });
  };

  const handleAIAnalysis = (problemChat: ProblemChat, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a problem object for the chat sheet
    const problemObject = {
      id: problemChat.id,
      title: problemChat.title,
      description: problemChat.problem_statement,
      originalStatement: problemChat.problem_statement,
      problemNumber: problemChat.problem_number
    };
    
    setSelectedProblem(problemChat);
    setChatSheetOpen(true);
  };

  const handleProblemClick = (problemChat: ProblemChat) => {
    // Handle problem chat selection - open AI analysis
    const problemObject = {
      id: problemChat.id,
      title: problemChat.title,
      description: problemChat.problem_statement,
      originalStatement: problemChat.problem_statement,
      problemNumber: problemChat.problem_number
    };
    
    setSelectedProblem(problemChat);
    setChatSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error loading problem chats. Please try again later.</p>
      </div>
    );
  }

  if (!problemChats.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No problem chats available yet. Create your first problem statement above!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problemChats.map((problemChat) => (
          <Card 
            key={problemChat.id}
            className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleProblemClick(problemChat)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-2">
                    {problemChat.problem_number}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mb-2">{problemChat.title}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 hover:scale-100"
                    onClick={(e) => handleFavorite(problemChat, e)}
                    title="Add to Favorites"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 hover:scale-100"
                    onClick={(e) => handleAIAnalysis(problemChat, e)}
                    title="AI Analysis"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Status Badge */}
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {problemChat.current_state}
                </Badge>

                {/* Problem Statement Preview */}
                <p className="text-sm text-gray-600 line-clamp-3">
                  {problemChat.problem_statement.length > 150 
                    ? `${problemChat.problem_statement.substring(0, 150)}...`
                    : problemChat.problem_statement
                  }
                </p>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{new Date(problemChat.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Chat Sheet */}
      {selectedProblem && (
        <AIChatSheet
          open={chatSheetOpen}
          onOpenChange={setChatSheetOpen}
          problem={{
            id: selectedProblem.id,
            title: selectedProblem.title,
            description: selectedProblem.problem_statement,
            originalStatement: selectedProblem.problem_statement,
            problemNumber: selectedProblem.problem_number
          }}
        />
      )}
    </>
  );
};
