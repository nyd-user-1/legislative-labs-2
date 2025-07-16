import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, User, Calendar, Lightbulb } from "lucide-react";
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
  const [chatEntityType, setChatEntityType] = useState<'problem' | 'solution'>('problem');

  const { data: problemChats = [], isLoading, error } = useQuery({
    queryKey: ['problem-chats'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          return [];
        }

        console.log('Fetching problem chats for user:', user.id);
        
        const { data, error } = await supabase
          .from('problem_chats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching problem chats:', error);
          throw error;
        }

        console.log('Successfully fetched problem chats:', data);
        return data as ProblemChat[];
      } catch (error) {
        console.error('Query function error:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
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
        (payload) => {
          console.log('Real-time update received:', payload);
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
    
    const problemObject = {
      id: problemChat.id,
      title: problemChat.title,
      description: problemChat.problem_statement,
      originalStatement: problemChat.problem_statement,
      problemNumber: problemChat.problem_number
    };
    
    setSelectedProblem(problemChat);
    setChatEntityType('problem');
    setChatSheetOpen(true);
  };

  const handleSolve = (problemChat: ProblemChat, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const solutionObject = {
      id: problemChat.id,
      title: problemChat.title,
      description: problemChat.problem_statement,
      originalStatement: problemChat.problem_statement,
      problemNumber: problemChat.problem_number
    };
    
    setSelectedProblem(problemChat);
    setChatEntityType('solution');
    setChatSheetOpen(true);
  };

  const handleProblemClick = (problemChat: ProblemChat) => {
    const problemObject = {
      id: problemChat.id,
      title: problemChat.title,
      description: problemChat.problem_statement,
      originalStatement: problemChat.problem_statement,
      problemNumber: problemChat.problem_number
    };
    
    setSelectedProblem(problemChat);
    setChatEntityType('problem');
    setChatSheetOpen(true);
  };

  const handlePublishProblem = (problemChat: ProblemChat, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Submitting Problem",
      description: `Problem ${problemChat.problem_number} will be submitted soon.`,
    });
  };

  // Add debug logging
  console.log('ProblemChatsGrid render:', { 
    isLoading, 
    error, 
    problemChatsCount: problemChats?.length,
    problemChats: problemChats 
  });

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
    console.error('Error in ProblemChatsGrid:', error);
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error loading problem chats: {error.message}</p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['problem-chats'] })}
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!problemChats || problemChats.length === 0) {
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
            className="card hover:shadow-md transition-shadow cursor-pointer h-80 flex flex-col"
            onClick={() => handleProblemClick(problemChat)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-2">
                    {problemChat.problem_number}
                  </CardTitle>
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
              
              {/* Spacer between problem number/buttons and badge */}
              <div className="mt-5"></div>
            </CardHeader>
            
            <CardContent className="pt-4 flex-1 flex flex-col">
              <div className="flex-1 space-y-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Problem Statement
                </Badge>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {problemChat.problem_statement.length > 150 
                    ? `${problemChat.problem_statement.substring(0, 150)}...`
                    : problemChat.problem_statement
                  }
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{new Date(problemChat.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Buttons pinned to bottom */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-auto"
                  onClick={(e) => handleSolve(problemChat, e)}
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Solve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-auto"
                  onClick={(e) => handlePublishProblem(problemChat, e)}
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProblem && (
        <AIChatSheet
          open={chatSheetOpen}
          onOpenChange={setChatSheetOpen}
          problem={chatEntityType === 'problem' ? {
            id: selectedProblem.id,
            title: selectedProblem.title,
            description: selectedProblem.problem_statement,
            originalStatement: selectedProblem.problem_statement,
            problemNumber: selectedProblem.problem_number
          } : undefined}
          solution={chatEntityType === 'solution' ? {
            id: selectedProblem.id,
            title: selectedProblem.title,
            description: selectedProblem.problem_statement,
            originalStatement: selectedProblem.problem_statement,
            problemNumber: selectedProblem.problem_number
          } : undefined}
        />
      )}
    </>
  );
};
