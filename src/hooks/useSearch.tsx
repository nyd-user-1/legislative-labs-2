import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SearchResult {
  id: string;
  title: string;
  type: 'problem' | 'idea' | 'draft' | 'media';
  content: string;
  created_at: string;
  url: string;
}

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allContent, setAllContent] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  // Fetch all user content on mount
  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch problem statements
      const { data: problems } = await supabase
        .from('problem_statements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch ideas
      const { data: ideas } = await supabase
        .from('legislative_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch drafts
      const { data: drafts } = await supabase
        .from('legislative_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch media outputs
      const { data: media } = await supabase
        .from('media_outputs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const allResults: SearchResult[] = [
        ...(problems?.map(p => ({
          id: p.id,
          title: p.title,
          type: 'problem' as const,
          content: p.description,
          created_at: p.created_at,
          url: `/problems?id=${p.id}`
        })) || []),
        ...(ideas?.map(i => ({
          id: i.id,
          title: i.title,
          type: 'idea' as const,
          content: i.improved_idea || i.original_idea,
          created_at: i.created_at,
          url: `/ideas?id=${i.id}`
        })) || []),
        ...(drafts?.map(d => ({
          id: d.id,
          title: d.title,
          type: 'draft' as const,
          content: d.draft_content,
          created_at: d.created_at,
          url: `/?id=${d.id}`
        })) || []),
        ...(media?.map(m => ({
          id: m.id,
          title: m.title,
          type: 'media' as const,
          content: m.content,
          created_at: m.created_at,
          url: `/media-kits?id=${m.id}`
        })) || [])
      ];

      setAllContent(allResults);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error fetching content",
        description: "Failed to load your content for search.",
        variant: "destructive",
      });
    }
  };

  // Filter content based on search term
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    return allContent.filter(item => 
      item.title.toLowerCase().includes(term) || 
      item.content.toLowerCase().includes(term)
    ).slice(0, 10); // Limit to 10 results
  }, [searchTerm, allContent]);

  useEffect(() => {
    setSearchResults(filteredResults);
  }, [filteredResults]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    clearSearch,
    refreshContent: fetchAllContent
  };
};