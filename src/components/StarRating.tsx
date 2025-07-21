import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface StarRatingProps {
  problemId: string;
  className?: string;
}

interface VoteStats {
  average_rating: number;
  total_votes: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ problemId, className = "" }) => {
  const [rating, setRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [voteStats, setVoteStats] = useState<VoteStats>({ average_rating: 0, total_votes: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVoteStats();
    if (user) {
      fetchUserVote();
    }
  }, [problemId, user]);

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
        setRating(data.rating);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const handleStarClick = async (selectedRating: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on problems.",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('problem_votes')
        .upsert({
          user_id: user.id,
          problem_id: problemId,
          rating: selectedRating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,problem_id'
        });

      if (error) {
        console.error('Error submitting vote:', error);
        toast({
          title: "Error",
          description: "Failed to submit your vote. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setUserRating(selectedRating);
      setRating(selectedRating);
      
      // Refresh vote stats
      await fetchVoteStats();
      
      toast({
        title: "Vote Submitted",
        description: `You rated this problem ${selectedRating} star${selectedRating !== 1 ? 's' : ''}.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayRating = hoveredRating || rating || voteStats.average_rating;

  return (
    <div className={`w-full ${className}`} style={{ marginTop: '1rem' }}>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <div className="flex items-center space-x-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6 hover:bg-transparent"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={isLoading}
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    star <= displayRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  } ${isLoading ? 'opacity-50' : ''}`}
                />
              </Button>
            ))}
          </div>
          {userRating && (
            <div className="text-primary text-xs">
              Your vote: {userRating} star{userRating !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground text-right">
          {voteStats.total_votes > 0 ? (
            <div className="flex flex-col items-end">
              <div className="font-medium">
                {voteStats.average_rating.toFixed(1)} stars
              </div>
              <div>
                {voteStats.total_votes} vote{voteStats.total_votes !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <div>No votes yet</div>
          )}
        </div>
      </div>
    </div>
  );
};