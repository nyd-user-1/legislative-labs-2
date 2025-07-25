
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlogProposal, BlogProposalStats, CreateBlogProposalRequest, UpdateBlogProposalRequest } from '@/types/blog';

export const useBlogProposals = () => {
  const [proposals, setProposals] = useState<BlogProposalStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_proposal_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'published' | 'archived'
      })) as BlogProposalStats[]);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Error",
        description: "Failed to load blog proposals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposal: CreateBlogProposalRequest) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blog_proposals')
        .insert({
          ...proposal,
          author_id: user.id,
          published_at: proposal.status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Proposal ${proposal.status === 'published' ? 'published' : 'saved as draft'}`,
      });

      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to create proposal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProposal = async (id: string, updates: UpdateBlogProposalRequest) => {
    try {
      const updateData = {
        ...updates,
        published_at: updates.status === 'published' ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('blog_proposals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Proposal updated successfully",
      });

      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to update proposal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Proposal deleted successfully",
      });

      await fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to delete proposal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementViewCount = async (id: string) => {
    try {
      // First get the current view count
      const { data: proposal, error: fetchError } = await supabase
        .from('blog_proposals')
        .select('view_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Then increment it
      const { error } = await supabase
        .from('blog_proposals')
        .update({ view_count: (proposal.view_count || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    createProposal,
    updateProposal,
    deleteProposal,
    incrementViewCount,
    refetch: fetchProposals,
  };
};
