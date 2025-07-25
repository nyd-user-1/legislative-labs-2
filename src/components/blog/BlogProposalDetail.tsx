
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Eye, MessageCircle, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBlogVotes } from '@/hooks/useBlogVotes';
import { useBlogComments } from '@/hooks/useBlogComments';
import { BlogProposal } from '@/types/blog';
import { BlogCommentSection } from './BlogCommentSection';

export const BlogProposalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proposal, setProposal] = useState<BlogProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState<{ username?: string; display_name?: string } | null>(null);

  const { userVote, vote, loading: voteLoading } = useBlogVotes(id || '');
  const { comments, loading: commentsLoading } = useBlogComments(id || '');

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_proposals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProposal({
        ...data,
        status: data.status as 'draft' | 'published' | 'archived'
      });

      // Fetch author information
      const { data: authorData } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', data.author_id)
        .single();

      setAuthor(authorData);

      // Increment view count
      const { data: currentProposal } = await supabase
        .from('blog_proposals')
        .select('view_count')
        .eq('id', id)
        .single();

      if (currentProposal) {
        await supabase
          .from('blog_proposals')
          .update({ view_count: (currentProposal.view_count || 0) + 1 })
          .eq('id', id);
      }

    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast({
        title: "Error",
        description: "Failed to load proposal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: proposal?.title,
          text: proposal?.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">Proposal not found</div>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate('/blog')}
              >
                Back to Blog
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status}
                </Badge>
                {proposal.is_featured && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Featured
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <CardTitle className="text-3xl mb-4">{proposal.title}</CardTitle>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-sm">
                    {getAuthorInitials(author?.display_name || author?.username)}
                  </AvatarFallback>
                </Avatar>
                <span>{author?.display_name || author?.username || 'Anonymous'}</span>
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{proposal.view_count} views</span>
              </div>
            </div>

            {proposal.category && (
              <div className="mb-4">
                <Badge variant="outline">{proposal.category}</Badge>
              </div>
            )}

            {proposal.tags && proposal.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {proposal.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {proposal.summary && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 font-medium">{proposal.summary}</p>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-wrap">{proposal.content}</div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={userVote?.vote_type === 'upvote' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => vote('upvote')}
                  disabled={voteLoading}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Upvote
                </Button>
                <Button
                  variant={userVote?.vote_type === 'downvote' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => vote('downvote')}
                  disabled={voteLoading}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Downvote
                </Button>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{comments.length} comments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <BlogCommentSection proposalId={proposal.id} />
      </div>
    </div>
  );
};
