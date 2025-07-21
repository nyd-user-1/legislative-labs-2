import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Star } from 'lucide-react';
import { useUserVotedProblems } from '@/hooks/useUserVotedProblems';
import { useAuth } from '@/contexts/AuthContext';

const VotedProblemsSection = () => {
  const { votedProblems, isLoading } = useUserVotedProblems();
  const { user } = useAuth();
  const navigate = useNavigate();

  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const handleProblemClick = (problemSlug: string) => {
    navigate(`/problems/${problemSlug}`);
  };

  if (!user) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Voted Problems
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sign in to see problems you've voted on
            </p>
          </div>
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white border border-[#e5e5e5] rounded-xl p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Please sign in to view your voted problems
              </p>
              <button 
                onClick={() => navigate('/auth')}
                className="text-[#ef4444] hover:underline"
              >
                Sign In →
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Voted Problems
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Loading your voted problems...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (votedProblems.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Voted Problems
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You haven't voted on any problems yet
            </p>
          </div>
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white border border-[#e5e5e5] rounded-xl p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Start voting on problems to see them here
              </p>
              <button 
                onClick={() => navigate('/problems')}
                className="text-[#ef4444] hover:underline"
              >
                Browse Problems →
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Voted Problems
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Problems you've rated and engaged with
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {votedProblems.map((problem) => (
              <Card
                key={problem.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
                onClick={() => handleProblemClick(problem.slug)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header with title and priority */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-[#1a1a1a] mb-2 leading-tight">
                          {problem.title}
                        </h3>
                        <Badge className={priorityColors[problem.priority]}>
                          {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)} Priority
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#666666] line-clamp-3 leading-relaxed">
                      {problem.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-[#666666]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{problem.subProblems} sub-problems</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{problem.solutions} solutions</span>
                        </div>
                      </div>
                    </div>

                    {/* Category and User Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-[#666666]">
                        <Users className="w-3 h-3" />
                        <span>{problem.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{problem.userRating}</span>
                      </div>
                    </div>

                    <div className="text-sm text-[#ef4444] hover:underline">
                      Learn more →
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VotedProblemsSection;