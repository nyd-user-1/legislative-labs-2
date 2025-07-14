
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Calendar, User, Target } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ProblemCardProps {
  problemChat: ProblemChat;
  onProblemSelect: (problemChat: ProblemChat) => void;
  onStateChange?: (problemChat: ProblemChat, newState: string) => void;
  onAIAnalysis?: (problemChat: ProblemChat, e: React.MouseEvent) => void;
  onFavorite?: (problemChat: ProblemChat, e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
}

const stateOptions = [
  "Problem Identified",
  "Policy Development", 
  "Policy Submission",
  "Public Gallery"
];

export const ProblemCard = ({ 
  problemChat, 
  onProblemSelect, 
  onStateChange,
  onAIAnalysis, 
  onFavorite, 
  isFavorited = false, 
  hasAIChat = false 
}: ProblemCardProps) => {
  const handleStateChange = (newState: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onStateChange?.(problemChat, newState);
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onProblemSelect(problemChat)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {problemChat.problem_number}
            </h3>
          </div>
          
          <CardActionButtons
            onFavorite={onFavorite ? (e) => onFavorite(problemChat, e) : undefined}
            onAIAnalysis={onAIAnalysis ? (e) => onAIAnalysis(problemChat, e) : undefined}
            isFavorited={isFavorited}
            hasAIChat={hasAIChat}
            showFavorite={!!onFavorite}
            showAIAnalysis={!!onAIAnalysis}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-6">
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate font-medium">{problemChat.title}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{formatDate(problemChat.created_at)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select
                value={problemChat.current_state}
                onValueChange={(value) => handleStateChange(value, event as any)}
              >
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Problem statement section */}
          {problemChat.problem_statement && (
            <div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {problemChat.problem_statement}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
