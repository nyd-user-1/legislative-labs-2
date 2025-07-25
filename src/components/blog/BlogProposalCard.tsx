
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Eye, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { BlogProposalStats } from "@/types/blog";

interface BlogProposalCardProps {
  proposal: BlogProposalStats;
  onView: (proposal: BlogProposalStats) => void;
  onEdit?: (proposal: BlogProposalStats) => void;
  onDelete?: (proposal: BlogProposalStats) => void;
  showActions?: boolean;
}

export const BlogProposalCard = ({ 
  proposal, 
  onView, 
  onEdit, 
  onDelete, 
  showActions = false 
}: BlogProposalCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthorInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="card hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => onView(proposal)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(proposal.status)}>
            {proposal.status}
          </Badge>
          {proposal.is_featured && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Featured
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-xl">{proposal.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {getAuthorInitials(proposal.display_name || proposal.username)}
            </AvatarFallback>
          </Avatar>
          <span>{proposal.display_name || proposal.username || 'Anonymous'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        {proposal.category && (
          <Badge variant="outline" className="mb-2">
            {proposal.category}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{proposal.view_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{proposal.upvotes}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="w-4 h-4" />
            <span>{proposal.downvotes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{proposal.comment_count}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(proposal)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={() => onDelete(proposal)}>
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
