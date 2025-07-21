
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VoteStats {
  average_rating: number;
  total_votes: number;
}

interface UseProblemVotingReturn {
  voteStats: VoteStats;
  userRating: number | null;
  isLoading: boolean;
  submitVote: (rating: number) => Promise<{ success: boolean; error?: string }>;
  hasUserVoted: boolean;
}

export const useProblemVoting = (problemId: string): UseProblemVotingReturn => {
  const [voteStats, setVoteStats] = useState<VoteStats>({ average_rating: 0, total_votes: 0 });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchVoteStats = async () => {
    try {
      const { data, error } = await supabase
        .from('problem_vote_stats')
        .select('*')
        .eq('problem_id', problemId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vote stats:', error);
        return;
      }

      if (data) {
        setVoteStats({
          average_rating: data.average_rating || 0,
          total_votes: data.total_votes || 0
        });
      }
    } catch (error) {
      console.error('Error fetching vote stats:', error);
    }
  };

  const fetchUserVote = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('problem_votes')
        .select('rating')
        .eq('problem_id', problemId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user vote:', error);
        return;
      }

      if (data) {
        setUserRating(data.rating);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const submitVote = async (rating: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('problem_votes')
        .upsert({
          user_id: user.id,
          problem_id: problemId,
          rating: rating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,problem_id'
        });

      if (error) {
        console.error('Error submitting vote:', error);
        return { success: false, error: 'Failed to submit vote' };
      }

      setUserRating(rating);
      await fetchVoteStats();
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting vote:', error);
      return { success: false, error: 'Failed to submit vote' };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoteStats();
    if (user) {
      fetchUserVote();
    }
  }, [problemId, user]);

  // Set up real-time subscription for vote updates
  useEffect(() => {
    const channel = supabase
      .channel(`problem-votes-${problemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'problem_votes',
          filter: `problem_id=eq.${problemId}`
        },
        () => {
          // Refetch vote stats when any vote changes for this problem
          fetchVoteStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [problemId]);

  return {
    voteStats,
    userRating,
    isLoading,
    submitVote,
    hasUserVoted: userRating !== null
  };
};
