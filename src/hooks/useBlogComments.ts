
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlogComment } from '@/types/blog';

interface CommentWithAuthor extends BlogComment {
  author: {
    username?: string;
    display_name?: string;
  };
}

export const useBlogComments = (proposalId: string) => {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          author:profiles!blog_comments_author_id_fkey (
            username,
            display_name
          )
        `)
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentCommentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to comment",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          proposal_id: proposalId,
          author_id: user.id,
          content,
          parent_comment_id: parentCommentId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      await fetchComments();
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .update({
          content,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });

      await fetchComments();
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [proposalId]);

  return {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
};
