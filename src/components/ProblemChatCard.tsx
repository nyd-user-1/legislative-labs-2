import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Copy, 
  Trash2, 
  MessageSquare,
  Clock,
  Target
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProblemChat } from "@/hooks/useProblemChats";

interface ProblemChatCardProps {
  problemChat: ProblemChat;
  onDelete: (chatId: string) => void;
  onCopy: (text: string) => void;
}

export const ProblemChatCard = ({
  problemChat,
  onDelete,
  onCopy,
}: ProblemChatCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleCopyProblemStatement = () => {
    onCopy(problemChat.problem_statement);
  };

  const handleCopyResponse = () => {
    if (problemChat.current_state && problemChat.current_state !== 'draft' && problemChat.current_state !== 'generating') {
      onCopy(problemChat.current_state);
    }
  };

  const handleDelete = () => {
    onDelete(problemChat.id);
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-lg">{problemChat.title}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className={getStateColor(problemChat.current_state)}>
              {problemChat.current_state === 'generating' ? 'Generating...' : 
               problemChat.current_state === 'draft' ? 'Draft' : 'Complete'}
            </Badge>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(problemChat.created_at)}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyProblemStatement}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Problem
            </DropdownMenuItem>
            {problemChat.current_state && 
             problemChat.current_state !== 'draft' && 
             problemChat.current_state !== 'generating' && (
              <DropdownMenuItem onClick={handleCopyResponse}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Response
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Problem Statement */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Original Problem:</h4>
          <p className="text-sm bg-muted/50 p-3 rounded-md leading-relaxed">
            {problemChat.problem_statement}
          </p>
        </div>

        {/* Current State/Response */}
        {problemChat.current_state && 
         problemChat.current_state !== 'draft' && 
         problemChat.current_state !== 'generating' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">AI Analysis:</h4>
            <div className="text-sm bg-primary/5 p-3 rounded-md leading-relaxed max-h-32 overflow-y-auto">
              {problemChat.current_state.length > 200 
                ? `${problemChat.current_state.substring(0, 200)}...`
                : problemChat.current_state
              }
            </div>
          </div>
        )}

        {problemChat.current_state === 'generating' && (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            Generating AI analysis...
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Problem #{problemChat.problem_number}</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Problem Chat
          </span>
        </div>
      </CardContent>
    </Card>
  );
};