
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

export interface BillFilters {
  searchTerm?: string;
  sponsorFilter?: string;
  committeeFilter?: string;
  dateRangeFilter?: string;
  page?: number;
  limit?: number;
}

export interface BillsResponse {
  bills: Bill[];
  totalCount: number;
  hasNextPage: boolean;
}

export const optimizedBillsService = {
  // Consolidated query that handles all filtering server-side
  async getBills(filters: BillFilters = {}): Promise<BillsResponse> {
    const {
      searchTerm = '',
      sponsorFilter = '',
      committeeFilter = '',
      dateRangeFilter = '',
      page = 0,
      limit = 50
    } = filters;

    let query = supabase
      .from('Bills')
      .select('*', { count: 'exact' });

    // Server-side text search
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,bill_number.ilike.%${searchTerm}%`);
    }

    // Server-side committee filtering
    if (committeeFilter) {
      query = query.eq('committee', committeeFilter);
    }

    // Server-side date filtering
    if (dateRangeFilter && dateRangeFilter !== '') {
      const now = new Date();
      let startDate: Date;

      switch (dateRangeFilter) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('status_date', startDate.toISOString());
    }

    // Pagination
    const startRange = page * limit;
    const endRange = startRange + limit - 1;
    query = query.range(startRange, endRange);

    // Sorting
    query = query.order('status_date', { ascending: false, nullsLast: true });

    const { data: bills, error, count } = await query;

    if (error) throw error;

    return {
      bills: bills || [],
      totalCount: count || 0,
      hasNextPage: (count || 0) > (page + 1) * limit,
    };
  },

  // Get committees and sponsors for filters
  async getFilterOptions() {
    const [committeesResponse, sponsorsResponse] = await Promise.all([
      supabase
        .from("Committees")
        .select("committee_name, chamber")
        .not("committee_name", "is", null)
        .order("committee_name"),
      supabase
        .from("People")
        .select("name, chamber, party")
        .not("name", "is", null)
        .order("name")
    ]);

    return {
      committees: committeesResponse.data?.map(item => ({
        name: item.committee_name || "",
        chamber: item.chamber || ""
      })).filter(c => c.name) || [],
      sponsors: sponsorsResponse.data?.map(item => ({
        name: item.name || "",
        chamber: item.chamber || "",
        party: item.party || ""
      })).filter(s => s.name) || []
    };
  },

  // Get single bill with related data
  async getBillById(id: number): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('Bills')
      .select('*')
      .eq('bill_id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
