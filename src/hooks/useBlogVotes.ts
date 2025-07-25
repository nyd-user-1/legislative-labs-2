
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlogVote } from '@/types/blog';

export const useBlogVotes = (proposalId: string) => {
  const [userVote, setUserVote] = useState<BlogVote | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserVote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('blog_votes')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('voter_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserVote(data || null);
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const vote = async (voteType: 'upvote' | 'downvote') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to vote",
          variant: "destructive",
        });
        return;
      }

      if (userVote) {
        if (userVote.vote_type === voteType) {
          // Remove vote if clicking same vote type
          const { error } = await supabase
            .from('blog_votes')
            .delete()
            .eq('id', userVote.id);

          if (error) throw error;
          setUserVote(null);
        } else {
          // Update vote type
          const { data, error } = await supabase
            .from('blog_votes')
            .update({ vote_type: voteType })
            .eq('id', userVote.id)
            .select()
            .single();

          if (error) throw error;
          setUserVote(data);
        }
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('blog_votes')
          .insert({
            proposal_id: proposalId,
            voter_id: user.id,
            vote_type: voteType,
          })
          .select()
          .single();

        if (error) throw error;
        setUserVote(data);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVote();
  }, [proposalId]);

  return {
    userVote,
    loading,
    vote,
    refetch: fetchUserVote,
  };
};
