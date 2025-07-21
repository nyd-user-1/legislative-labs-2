import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { problems, Problem } from '@/data/problems';

interface UserVotedProblem extends Problem {
  userRating: number;
  votedAt: string;
}

export const useUserVotedProblems = () => {
  const [votedProblems, setVotedProblems] = useState<UserVotedProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserVotedProblems = async () => {
      if (!user) {
        setVotedProblems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data: votes, error } = await supabase
          .from('problem_votes')
          .select('problem_id, rating, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user votes:', error);
          setVotedProblems([]);
          return;
        }

        if (votes) {
          // Map votes to problems
          const votedProblemsData: UserVotedProblem[] = votes
            .map(vote => {
              const problem = problems.find(p => p.id === vote.problem_id);
              if (problem) {
                return {
                  ...problem,
                  userRating: vote.rating,
                  votedAt: vote.created_at
                };
              }
              return null;
            })
            .filter(Boolean) as UserVotedProblem[];

          setVotedProblems(votedProblemsData);
        }
      } catch (error) {
        console.error('Error fetching user voted problems:', error);
        setVotedProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserVotedProblems();
  }, [user]);

  return { votedProblems, isLoading };
};