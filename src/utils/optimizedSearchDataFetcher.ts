
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";

export const fetchOptimizedSearchContent = async (): Promise<SearchResult[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Parallel queries for better performance
    const queries = [];

    // User content (requires auth)
    if (user) {
      queries.push(
        supabase
          .from('problem_statements')
          .select('id, title, description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('legislative_ideas')
          .select('id, title, improved_idea, original_idea, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('legislative_drafts')
          .select('id, title, draft_content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('media_outputs')
          .select('id, title, content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
      );
    }

    // Public legislative data - optimized queries
    queries.push(
      supabase
        .from('Bills')
        .select('bill_id, title, bill_number, description, last_action, status_date')
        .not('title', 'is', null)
        .order('bill_id', { ascending: false })
        .limit(100),

      supabase
        .from('People')
        .select('people_id, name, first_name, last_name, party, chamber, district, bio_short')
        .not('name', 'is', null)
        .order('people_id', { ascending: false })
        .limit(200),

      supabase
        .from('Committees')
        .select('committee_id, committee_name, description, chair_name')
        .not('committee_name', 'is', null)
        .order('committee_id', { ascending: false })
        .limit(50)
    );

    // Execute all queries in parallel
    const results = await Promise.allSettled(queries);

    // Process results with proper error handling
    const allResults: SearchResult[] = [];
    let resultIndex = 0;

    // Process user content if authenticated
    if (user) {
      const [problems, ideas, drafts, media] = results.slice(0, 4);

      if (problems.status === 'fulfilled' && problems.value.data) {
        problems.value.data.forEach(p => {
          allResults.push({
            id: p.id,
            title: p.title,
            type: 'problem' as const,
            content: p.description,
            created_at: p.created_at,
            url: `/problems?id=${p.id}`
          });
        });
      }

      if (ideas.status === 'fulfilled' && ideas.value.data) {
        ideas.value.data.forEach(i => {
          allResults.push({
            id: i.id,
            title: i.title,
            type: 'idea' as const,
            content: i.improved_idea || i.original_idea,
            created_at: i.created_at,
            url: `/ideas?id=${i.id}`
          });
        });
      }

      if (drafts.status === 'fulfilled' && drafts.value.data) {
        drafts.value.data.forEach(d => {
          allResults.push({
            id: d.id,
            title: d.title,
            type: 'draft' as const,
            content: d.draft_content,
            created_at: d.created_at,
            url: `/?id=${d.id}`
          });
        });
      }

      if (media.status === 'fulfilled' && media.value.data) {
        media.value.data.forEach(m => {
          allResults.push({
            id: m.id,
            title: m.title,
            type: 'media' as const,
            content: m.content,
            created_at: m.created_at,
            url: `/media-kits?id=${m.id}`
          });
        });
      }

      resultIndex = 4;
    }

    // Process legislative data
    const [bills, members, committees] = results.slice(resultIndex);

    if (bills.status === 'fulfilled' && bills.value.data) {
      bills.value.data.forEach(b => {
        allResults.push({
          id: b.bill_id.toString(),
          title: b.title || b.bill_number || 'Untitled Bill',
          type: 'bill' as const,
          content: b.description || b.last_action || '',
          created_at: b.status_date || new Date().toISOString(),
          url: `/bills?selected=${b.bill_id}`
        });
      });
    }

    if (members.status === 'fulfilled' && members.value.data) {
      members.value.data.forEach(m => {
        allResults.push({
          id: m.people_id.toString(),
          title: m.name || `${m.first_name} ${m.last_name}`.trim() || 'Unknown Member',
          type: 'member' as const,
          content: `${m.party || ''} ${m.chamber || ''} ${m.district || ''}`.trim() || m.bio_short || '',
          created_at: new Date().toISOString(),
          url: `/members?selected=${m.people_id}`
        });
      });
    }

    if (committees.status === 'fulfilled' && committees.value.data) {
      committees.value.data.forEach(c => {
        allResults.push({
          id: c.committee_id.toString(),
          title: c.committee_name || 'Untitled Committee',
          type: 'committee' as const,
          content: c.description || c.chair_name || '',
          created_at: new Date().toISOString(),
          url: `/committees?selected=${c.committee_id}`
        });
      });
    }

    return allResults;
  } catch (error) {
    console.error('Error fetching optimized search content:', error);
    throw error;
  }
};
