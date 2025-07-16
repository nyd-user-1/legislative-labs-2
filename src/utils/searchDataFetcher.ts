
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";

export const fetchAllSearchContent = async (): Promise<SearchResult[]> => {
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

    // Fetch public legislative data (no auth required) - NY ONLY
    const { data: bills } = await supabase
      .from('Bills')
      .select('*')
      .limit(500)
      .order('bill_id', { ascending: false });

    const { data: members } = await supabase
      .from('People')
      .select('*')
      .limit(1000)
      .order('people_id', { ascending: false });

    console.log('Raw members data:', members?.length);

    const { data: committees } = await supabase
      .from('Committees')
      .select('*')
      .limit(200)
      .order('committee_id', { ascending: false });

    const allResults: SearchResult[] = [
      // User content
      ...(problems?.map(p => ({
        id: p.id,
        title: p.title,
        type: 'problem' as const,
        content: p.description,
        created_at: p.created_at,
        url: `/problems?id=${p.id}`,
        source: 'local' as const
      })) || []),
      ...(ideas?.map(i => ({
        id: i.id,
        title: i.title,
        type: 'idea' as const,
        content: i.improved_idea || i.original_idea,
        created_at: i.created_at,
        url: `/ideas?id=${i.id}`,
        source: 'local' as const
      })) || []),
      ...(drafts?.map(d => ({
        id: d.id,
        title: d.title,
        type: 'draft' as const,
        content: d.draft_content,
        created_at: d.created_at,
        url: `/?id=${d.id}`,
        source: 'local' as const
      })) || []),
      ...(media?.map(m => ({
        id: m.id,
        title: m.title,
        type: 'media' as const,
        content: m.content,
        created_at: m.created_at,
        url: `/media-kits?id=${m.id}`,
        source: 'local' as const
      })) || []),
      // Legislative data - NY ONLY (from our NY database)
      ...(bills?.map(b => ({
        id: b.bill_id.toString(),
        title: b.title || b.bill_number || 'Untitled Bill',
        type: 'bill' as const,
        content: b.description || b.last_action || '',
        created_at: b.status_date || new Date().toISOString(),
        url: `/bills?selected=${b.bill_id}`,
        source: 'nys' as const
      })) || []),
      ...(members?.map(m => ({
        id: m.people_id.toString(),
        title: m.name || `${m.first_name} ${m.last_name}`.trim() || 'Unknown Member',
        type: 'member' as const,
        content: `${m.party || ''} ${m.chamber || ''} ${m.district || ''}`.trim() || m.bio_short || '',
        created_at: new Date().toISOString(),
        url: `/members?selected=${m.people_id}`,
        source: 'nys' as const
      })) || []),
      ...(committees?.map(c => ({
        id: c.committee_id.toString(),
        title: c.committee_name || 'Untitled Committee',
        type: 'committee' as const,
        content: c.description || c.chair_name || '',
        created_at: new Date().toISOString(),
        url: `/committees?selected=${c.committee_id}`,
        source: 'nys' as const
      })) || [])
    ];

    return allResults;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

// RESTRICTED TO NY ONLY - Do not use this for general searches
export const searchLegiscanContent = async (searchTerm: string, allowAllStates = false): Promise<SearchResult[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('legiscan-search', {
      body: {
        operation: 'search',
        params: {
          query: searchTerm,
          // ALWAYS restrict to NY unless explicitly allowed for AI chat
          state: allowAllStates ? undefined : 'NY',
          page: 1
        }
      }
    });

    if (error || !data || data.status === 'ERROR') {
      console.error('Legiscan search error:', error || data?.error);
      return [];
    }

    if (!data.searchresult?.results) {
      return [];
    }

    return data.searchresult.results.map((bill: any) => ({
      id: `legiscan-${bill.bill_id}`,
      title: bill.title || bill.bill_number || 'Untitled Bill',
      type: 'bill' as const,
      content: bill.description || bill.last_action || '',
      created_at: bill.status_date || new Date().toISOString(),
      url: bill.state_link || bill.url || '#',
      source: 'legiscan' as const
    }));
  } catch (error) {
    console.error('Error searching Legiscan:', error);
    return [];
  }
};

// Function specifically for AI chat similar bills analysis (allows all states)
// This is the ONLY exception to the NY-only rule
export const searchSimilarBillsAllStates = async (searchTerm: string): Promise<SearchResult[]> => {
  console.log('AI Chat: Searching similar bills across all states for analysis');
  return await searchLegiscanContent(searchTerm, true);
};
