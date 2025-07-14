import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, User, Calendar, Lightbulb, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIChatSheet } from "../AIChatSheet";

interface SolutionChat {
  id: string;
  problem_number: string;
  title: string;
  problem_statement: string;
  current_state: string;
  created_at: string;
  user_id: string;
  chat_session_id: string | null;
}

export const SolutionChatsGrid = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSolution, setSelectedSolution] = useState<SolutionChat | null>(null);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [mediaKitSheetOpen, setMediaKitSheetOpen] = useState(false);
  const [mediaKitContent, setMediaKitContent] = useState<any>(null);

  // For now, we'll use the same problem_chats table but filter for solutions
  // In a real implementation, you might want a separate solutions table
  const { data: solutionChats = [], isLoading, error } = useQuery({
    queryKey: ['solution-chats'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          return [];
        }

        console.log('Fetching solution chats for user:', user.id);
        
        // Fetch chat sessions that contain solution-related content
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .like('title', '%Solution%')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching solution chats:', error);
          throw error;
        }

        console.log('Successfully fetched solution chats:', data);
        
        // Transform chat sessions to match the expected format
        return data.map(session => ({
          id: session.id,
          problem_number: session.title.replace('Solution: ', ''),
          title: session.title,
          problem_statement: 'Solution generated from problem analysis',
          current_state: 'Solution Generated',
          created_at: session.created_at,
          user_id: session.user_id,
          chat_session_id: session.id
        })) as SolutionChat[];
      } catch (error) {
        console.error('Query function error:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('solution-chats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['solution-chats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleFavorite = (solutionChat: SolutionChat, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Added to favorites",
      description: `Solution ${solutionChat.problem_number} has been favorited.`,
    });
  };

  const handleAIAnalysis = (solutionChat: SolutionChat, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const solutionObject = {
      id: solutionChat.id,
      title: solutionChat.title,
      description: solutionChat.problem_statement,
      originalStatement: solutionChat.problem_statement,
      problemNumber: solutionChat.problem_number
    };
    
    setSelectedSolution(solutionChat);
    setChatSheetOpen(true);
  };

  const handleMediaKit = async (solutionChat: SolutionChat, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Fetch the full solution content from the chat session
    let solutionContent = solutionChat.problem_statement;
    
    if (solutionChat.chat_session_id) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('messages')
          .eq('id', solutionChat.chat_session_id)
          .single();
          
        if (data && !error) {
          const messages = JSON.parse(String(data.messages) || '[]');
          // Get the last assistant message which should contain the full solution
          const lastAssistantMessage = messages
            .filter((msg: any) => msg.role === 'assistant')
            .pop();
          
          if (lastAssistantMessage && lastAssistantMessage.content) {
            solutionContent = lastAssistantMessage.content;
          }
        }
      } catch (error) {
        console.error('Error fetching solution content:', error);
      }
    }
    
    const mediaKitObject = {
      id: `media-kit-${solutionChat.id}`,
      title: `Media Kit for ${solutionChat.problem_number}`,
      description: `Media kit for solution: ${solutionChat.title}`,
      originalStatement: solutionContent, // Pass the full solution content
      mediaKitNumber: `MK-${solutionChat.problem_number}`,
      solutionContent: solutionContent // Additional field for clarity
    };
    
    setMediaKitContent(mediaKitObject);
    setMediaKitSheetOpen(true);
    
    toast({
      title: "Generating Media Kit",
      description: `Creating comprehensive media materials for ${solutionChat.problem_number}`,
    });
  };

  const handleSolutionClick = (solutionChat: SolutionChat) => {
    const solutionObject = {
      id: solutionChat.id,
      title: solutionChat.title,
      description: solutionChat.problem_statement,
      originalStatement: solutionChat.problem_statement,
      problemNumber: solutionChat.problem_number
    };
    
    setSelectedSolution(solutionChat);
    setChatSheetOpen(true);
  };

  const handlePublishSolution = (solutionChat: SolutionChat, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Submitting Solution",
      description: `Solution ${solutionChat.problem_number} will be submitted soon.`,
    });
  };

  console.log('SolutionChatsGrid render:', { 
    isLoading, 
    error, 
    solutionChatsCount: solutionChats?.length,
    solutionChats: solutionChats 
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
    console.error('Error in SolutionChatsGrid:', error);
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error loading solution chats: {error.message}</p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['solution-chats'] })}
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!solutionChats || solutionChats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No solution chats available yet. Generate solutions from your problem statements!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutionChats.map((solutionChat) => (
          <Card 
            key={solutionChat.id}
            className="card hover:shadow-md transition-shadow cursor-pointer h-80 flex flex-col"
            onClick={() => handleSolutionClick(solutionChat)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-2">
                    {solutionChat.problem_number}
                  </CardTitle>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 hover:scale-100"
                    onClick={(e) => handleFavorite(solutionChat, e)}
                    title="Add to Favorites"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 hover:scale-100"
                    onClick={(e) => handleAIAnalysis(solutionChat, e)}
                    title="AI Analysis"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-5"></div>
            </CardHeader>
            
            <CardContent className="pt-4 flex-1 flex flex-col">
              <div className="flex-1 space-y-3">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Solution Statement
                </Badge>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {solutionChat.problem_statement.length > 150 
                    ? `${solutionChat.problem_statement.substring(0, 150)}...`
                    : solutionChat.problem_statement
                  }
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{new Date(solutionChat.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-auto"
                  onClick={(e) => handleMediaKit(solutionChat, e)}
                >
                  <Megaphone className="h-4 w-4 mr-1" />
                  Media Kit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-auto"
                  onClick={(e) => handlePublishSolution(solutionChat, e)}
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Chat Sheet for viewing existing solutions */}
      <AIChatSheet
        open={chatSheetOpen}
        onOpenChange={setChatSheetOpen}
        solution={selectedSolution ? {
          id: selectedSolution.id,
          title: selectedSolution.title,
          description: selectedSolution.problem_statement,
          originalStatement: selectedSolution.problem_statement,
          problemNumber: selectedSolution.problem_number
        } : null}
      />

      {/* AI Chat Sheet for media kit generation */}
      <AIChatSheet
        open={mediaKitSheetOpen}
        onOpenChange={setMediaKitSheetOpen}
        mediaKit={mediaKitContent}
      />
    </>
  );
};
