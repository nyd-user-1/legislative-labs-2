
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

export interface MemberFilters {
  searchTerm?: string;
  chamberFilter?: string;
  partyFilter?: string;
  districtFilter?: string;
  page?: number;
  limit?: number;
}

export interface MembersResponse {
  members: Member[];
  totalCount: number;
  hasNextPage: boolean;
}

export const optimizedMembersService = {
  async getMembers(filters: MemberFilters = {}): Promise<MembersResponse> {
    const {
      searchTerm = '',
      chamberFilter = 'all',
      partyFilter = 'all',
      districtFilter = 'all',
      page = 0,
      limit = 50
    } = filters;

    let query = supabase
      .from('People')
      .select('*', { count: 'exact' });

    // Server-side search
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
    }

    // Server-side filtering
    if (chamberFilter !== 'all') {
      query = query.eq('chamber', chamberFilter);
    }

    if (partyFilter !== 'all') {
      query = query.eq('party', partyFilter);
    }

    if (districtFilter !== 'all') {
      query = query.eq('district', districtFilter);
    }

    // Pagination
    const startRange = page * limit;
    const endRange = startRange + limit - 1;
    query = query.range(startRange, endRange);

    // Sorting
    query = query.order('name', { ascending: true, nullsFirst: false });

    const { data: members, error, count } = await query;

    if (error) throw error;

    return {
      members: members || [],
      totalCount: count || 0,
      hasNextPage: (count || 0) > (page + 1) * limit,
    };
  },

  async getFilterOptions() {
    const { data: members, error } = await supabase
      .from('People')
      .select('chamber, party, district')
      .not('chamber', 'is', null)
      .not('party', 'is', null)
      .not('district', 'is', null);

    if (error) throw error;

    const chambers = [...new Set(members?.map(m => m.chamber).filter(Boolean))] as string[];
    const parties = [...new Set(members?.map(m => m.party).filter(Boolean))] as string[];
    const districts = [...new Set(members?.map(m => m.district).filter(Boolean))] as string[];

    return { chambers, parties, districts };
  },

  async getMemberById(id: number): Promise<Member | null> {
    const { data, error } = await supabase
      .from('People')
      .select('*')
      .eq('people_id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
