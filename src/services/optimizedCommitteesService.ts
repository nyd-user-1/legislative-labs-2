
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Committee = Tables<"Committees">;

export interface CommitteeFilters {
  searchTerm?: string;
  chamberFilter?: string;
  page?: number;
  limit?: number;
}

export interface CommitteesResponse {
  committees: Committee[];
  totalCount: number;
  hasNextPage: boolean;
}

export const optimizedCommitteesService = {
  async getCommittees(filters: CommitteeFilters = {}): Promise<CommitteesResponse> {
    const {
      searchTerm = '',
      chamberFilter = 'all',
      page = 0,
      limit = 100
    } = filters;

    let query = supabase
      .from('Committees')
      .select('*', { count: 'exact' });

    // Server-side search
    if (searchTerm) {
      query = query.or(`committee_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,chair_name.ilike.%${searchTerm}%`);
    }

    // Server-side chamber filtering
    if (chamberFilter !== 'all') {
      query = query.eq('chamber', chamberFilter);
    }

    // Pagination
    const startRange = page * limit;
    const endRange = startRange + limit - 1;
    query = query.range(startRange, endRange);

    // Sorting
    query = query.order('committee_name', { ascending: true, nullsLast: true });

    const { data: committees, error, count } = await query;

    if (error) throw error;

    return {
      committees: committees || [],
      totalCount: count || 0,
      hasNextPage: (count || 0) > (page + 1) * limit,
    };
  },

  async getFilterOptions() {
    const { data: committees, error } = await supabase
      .from('Committees')
      .select('chamber')
      .not('chamber', 'is', null);

    if (error) throw error;

    const chambers = [...new Set(committees?.map(c => c.chamber).filter(Boolean))] as string[];
    return { chambers };
  },

  async getCommitteeById(id: number): Promise<Committee | null> {
    const { data, error } = await supabase
      .from('Committees')
      .select('*')
      .eq('committee_id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
