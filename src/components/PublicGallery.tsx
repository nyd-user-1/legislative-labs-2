import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LegislativeDraft } from "@/types/legislation";
import { ThumbsUp, ThumbsDown, Minus, Eye, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublicGalleryProps {
  onDraftSelect: (draft: LegislativeDraft) => void;
}

export const PublicGallery = ({ onDraftSelect }: PublicGalleryProps) => {
  const [publicDrafts, setPublicDrafts] = useState<LegislativeDraft[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'support' | 'oppose' | 'neutral'>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadPublicDrafts();
    loadUserVotes();
  }, []);

  const loadPublicDrafts = () => {
    const allDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    const publicDrafts = allDrafts.filter((draft: LegislativeDraft) => draft.isPublic);
    setPublicDrafts(publicDrafts);
  };

  const loadUserVotes = () => {
    const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    setUserVotes(votes);
  };

  const vote = (draftId: string, voteType: 'support' | 'oppose' | 'neutral') => {
    // Update user's vote record
    const newUserVotes = { ...userVotes, [draftId]: voteType };
    setUserVotes(newUserVotes);
    localStorage.setItem('userVotes', JSON.stringify(newUserVotes));

    // Update draft votes
    const allDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    const updatedDrafts = allDrafts.map((draft: LegislativeDraft) => {
      if (draft.id === draftId) {
        const updatedVotes = { ...draft.votes };
        
        // Remove previous vote if exists
        const previousVote = userVotes[draftId];
        if (previousVote) {
          updatedVotes[previousVote]--;
        }
        
        // Add new vote
        updatedVotes[voteType]++;
        
        return { ...draft, votes: updatedVotes };
      }
      return draft;
    });

    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));
    setPublicDrafts(updatedDrafts.filter((draft: LegislativeDraft) => draft.isPublic));

    toast({
      title: "Vote recorded",
      description: `Your ${voteType} vote has been recorded anonymously.`,
    });
  };

  const getTotalVotes = (votes: LegislativeDraft['votes']) => {
    return votes.support + votes.oppose + votes.neutral;
  };

  const getVotePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Bill': return 'bg-blue-100 text-blue-800';
      case 'Resolution': return 'bg-green-100 text-green-800';
      case 'Amendment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (publicDrafts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Public Legislation Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            When legislation is saved and made public, it will appear here for community review and voting.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Public Legislation Gallery</h2>
          <p className="text-muted-foreground">Community legislation open for anonymous voting</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {publicDrafts.length} public {publicDrafts.length === 1 ? 'draft' : 'drafts'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicDrafts.map((draft) => {
          const totalVotes = getTotalVotes(draft.votes);
          const userVote = userVotes[draft.id];
          
          return (
            <Card key={draft.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-medium line-clamp-2 flex-1">
                    {draft.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDraftSelect(draft)}
                    className="ml-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getTypeColor(draft.type)}`}>
                    {draft.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(draft.createdAt)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {draft.originalIdea && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {draft.originalIdea}
                  </p>
                )}

                {/* Voting Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Community Sentiment</span>
                    <span className="text-muted-foreground">{totalVotes} votes</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <div className="text-green-600 font-medium">
                        {getVotePercentage(draft.votes.support, totalVotes)}%
                      </div>
                      <div className="text-muted-foreground">Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 font-medium">
                        {getVotePercentage(draft.votes.neutral, totalVotes)}%
                      </div>
                      <div className="text-muted-foreground">Neutral</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-medium">
                        {getVotePercentage(draft.votes.oppose, totalVotes)}%
                      </div>
                      <div className="text-muted-foreground">Oppose</div>
                    </div>
                  </div>
                </div>

                {/* Voting Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={userVote === 'support' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => vote(draft.id, 'support')}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Support
                  </Button>
                  <Button
                    variant={userVote === 'neutral' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => vote(draft.id, 'neutral')}
                    className="flex-1"
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Neutral
                  </Button>
                  <Button
                    variant={userVote === 'oppose' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => vote(draft.id, 'oppose')}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    Oppose
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};