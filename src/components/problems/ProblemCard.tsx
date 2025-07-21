import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/data/problems";
import { Target, TrendingUp, Users } from "lucide-react";
import { StarRating } from "@/components/StarRating";

interface ProblemCardProps {
  problem: Problem;
  onClick: () => void;
}

export const ProblemCard = ({ problem, onClick }: ProblemCardProps) => {
  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with title and priority */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-2">
                {problem.title}
              </h3>
              <Badge className={priorityColors[problem.priority]}>
                {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)} Priority
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {problem.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
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

          {/* Category and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{problem.category}</span>
            </div>
            <StarRating 
              problemId={problem.id} 
              showVoteCount={false}
              showStars={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};