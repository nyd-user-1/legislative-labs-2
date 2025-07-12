import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SearchResult {
  id: string;
  title: string;
  type: 'problem' | 'idea' | 'draft' | 'media' | 'bill' | 'member' | 'committee';
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
      
      // Fetch user content (requires auth)
      let problems, ideas, drafts, media;
      if (user) {
        // Fetch problem statements
        const problemsResult = await supabase
          .from('problem_statements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        problems = problemsResult.data;

        // Fetch ideas
        const ideasResult = await supabase
          .from('legislative_ideas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        ideas = ideasResult.data;

        // Fetch drafts
        const draftsResult = await supabase
          .from('legislative_drafts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        drafts = draftsResult.data;

        // Fetch media outputs
        const mediaResult = await supabase
          .from('media_outputs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        media = mediaResult.data;
      }

      // Fetch public legislative data (no auth required)
      const { data: bills } = await supabase
        .from('Bills')
        .select('*')
        .limit(100)
        .order('bill_id', { ascending: false });

      const { data: members } = await supabase
        .from('People')
        .select('*')
        .limit(100)
        .order('people_id', { ascending: false });

      const { data: committees } = await supabase
        .from('Committees')
        .select('*')
        .limit(100)
        .order('committee_id', { ascending: false });

      const allResults: SearchResult[] = [
        // User content
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
        })) || []),
        // Legislative data
        ...(bills?.map(b => ({
          id: b.bill_id.toString(),
          title: b.title || b.bill_number || 'Untitled Bill',
          type: 'bill' as const,
          content: b.description || b.last_action || '',
          created_at: b.status_date || new Date().toISOString(),
          url: `/bills?selected=${b.bill_id}`
        })) || []),
        ...(members?.map(m => ({
          id: m.people_id.toString(),
          title: m.name || `${m.first_name} ${m.last_name}`.trim() || 'Unknown Member',
          type: 'member' as const,
          content: `${m.party || ''} ${m.chamber || ''} ${m.district || ''}`.trim() || m.bio_short || '',
          created_at: new Date().toISOString(),
          url: `/members?selected=${m.people_id}`
        })) || []),
        ...(committees?.map(c => ({
          id: c.committee_id.toString(),
          title: c.committee_name || 'Untitled Committee',
          type: 'committee' as const,
          content: c.description || c.chair_name || '',
          created_at: new Date().toISOString(),
          url: `/committees?selected=${c.committee_id}`
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
    
    // Common name variations and nicknames
    const nameVariations: Record<string, string[]> = {
      'jose': ['joseph'],
      'joe': ['joseph'],
      'jos': ['joseph'],
      'joey': ['joseph'],
      'mike': ['michael'],
      'bill': ['william'],
      'will': ['william'],
      'bob': ['robert'],
      'rob': ['robert'],
      'rick': ['richard'],
      'dick': ['richard'],
      'jim': ['james'],
      'jimmy': ['james'],
      'tom': ['thomas'],
      'tommy': ['thomas'],
      'dan': ['daniel'],
      'danny': ['daniel'],
      'dave': ['david'],
      'chris': ['christopher'],
      'matt': ['matthew'],
      'tony': ['anthony'],
      'nick': ['nicholas'],
      'alex': ['alexander']
    };

    return allContent.filter(item => {
      const title = item.title.toLowerCase();
      const content = item.content.toLowerCase();
      
      // Direct substring match
      if (title.includes(term) || content.includes(term)) {
        return true;
      }
      
      // Check name variations for member searches
      if (item.type === 'member') {
        // Check if search term is a nickname
        if (nameVariations[term]) {
          for (const variation of nameVariations[term]) {
            if (title.includes(variation) || content.includes(variation)) {
              return true;
            }
          }
        }
        
        // Check word boundaries for better name matching
        const searchWords = term.split(' ').filter(word => word.length > 0);
        const titleWords = title.split(' ').filter(word => word.length > 0);
        
        // If any search word matches the beginning of any title word
        for (const searchWord of searchWords) {
          for (const titleWord of titleWords) {
            if (titleWord.startsWith(searchWord) || searchWord.startsWith(titleWord)) {
              return true;
            }
          }
        }
      }
      
      return false;
    }).slice(0, 10); // Limit to 10 results
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