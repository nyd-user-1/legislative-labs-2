import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  NYSBill, 
  NYSMember, 
  NYSAgenda, 
  NYSCalendar, 
  NYSLaw,
  NYSSearchResult,
  SearchParams,
  DateRange 
} from '@/types/nysApi';

interface UseNYSApiReturn {
  loading: boolean;
  error: string | null;
  
  // Bills
  getBill: (sessionYear: number, printNo: string) => Promise<NYSBill | null>;
  searchBills: (params: SearchParams & { sessionYear?: number }) => Promise<NYSSearchResult<NYSBill> | null>;
  getBillUpdates: (dateRange: DateRange) => Promise<any | null>;
  
  // Agendas & Committees
  getAgenda: (year: number, agendaNo: number, committeeName?: string) => Promise<NYSAgenda | null>;
  listAgendas: (year: number, limit?: number, offset?: number) => Promise<NYSSearchResult<NYSAgenda> | null>;
  getCommitteeMeetings: (dateRange: DateRange) => Promise<any | null>;
  
  // Members
  getMember: (sessionYear: number, id: number) => Promise<NYSMember | null>;
  listMembers: (sessionYear: number, chamber?: string, limit?: number, offset?: number) => Promise<NYSSearchResult<NYSMember> | null>;
  searchMembers: (params: SearchParams) => Promise<NYSSearchResult<NYSMember> | null>;
  
  // Calendars
  getCalendar: (year: number, calendarNumber: number) => Promise<NYSCalendar | null>;
  listCalendars: (year: number, limit?: number, offset?: number) => Promise<NYSSearchResult<NYSCalendar> | null>;
  
  // Laws
  listLaws: () => Promise<NYSSearchResult<NYSLaw> | null>;
  getLaw: (lawId: string) => Promise<NYSLaw | null>;
  searchLaws: (params: SearchParams & { lawId?: string }) => Promise<NYSSearchResult<any> | null>;
}

export const useNYSApi = (): UseNYSApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeApiCall = useCallback(async function<T>(action: string, params: Record<string, any> = {}): Promise<T | null> {
    setLoading(true);
    setError(null);

    try {
      console.log('Making NYS API call:', action, params);
      
      const { data, error: functionError } = await supabase.functions.invoke('nys-legislation-api', {
        body: { action, params },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('NYS API response:', { data, error: functionError });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(`Function error: ${functionError.message}`);
      }

      if (!data) {
        throw new Error('No data returned from API');
      }

      if (!data.success) {
        console.error('API call failed:', data);
        throw new Error(data.error || 'API call failed');
      }

      console.log('API call successful:', data.data);
      return data.data as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('NYS API Error:', errorMessage, err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBill = useCallback(async (sessionYear: number, printNo: string): Promise<NYSBill | null> => {
    return makeApiCall<NYSBill>('getBill', { sessionYear, printNo });
  }, [makeApiCall]);

  const searchBills = useCallback(async (params: SearchParams & { sessionYear?: number }): Promise<NYSSearchResult<NYSBill> | null> => {
    return makeApiCall<NYSSearchResult<NYSBill>>('searchBills', params);
  }, [makeApiCall]);

  const getBillUpdates = useCallback(async (dateRange: DateRange): Promise<any | null> => {
    return makeApiCall('getBillUpdates', dateRange);
  }, [makeApiCall]);

  const getAgenda = useCallback(async (year: number, agendaNo: number, committeeName?: string): Promise<NYSAgenda | null> => {
    return makeApiCall<NYSAgenda>('getAgenda', { year, agendaNo, committeeName });
  }, [makeApiCall]);

  const listAgendas = useCallback(async (year: number, limit = 50, offset = 0): Promise<NYSSearchResult<NYSAgenda> | null> => {
    return makeApiCall<NYSSearchResult<NYSAgenda>>('listAgendas', { year, limit, offset });
  }, [makeApiCall]);

  const getCommitteeMeetings = useCallback(async (dateRange: DateRange): Promise<any | null> => {
    return makeApiCall('getCommitteeMeetings', dateRange);
  }, [makeApiCall]);

  const getMember = useCallback(async (sessionYear: number, id: number): Promise<NYSMember | null> => {
    return makeApiCall<NYSMember>('getMember', { sessionYear, id });
  }, [makeApiCall]);

  const listMembers = useCallback(async (sessionYear: number, chamber?: string, limit = 50, offset = 0): Promise<NYSSearchResult<NYSMember> | null> => {
    return makeApiCall<NYSSearchResult<NYSMember>>('listMembers', { sessionYear, chamber, limit, offset });
  }, [makeApiCall]);

  const searchMembers = useCallback(async (params: SearchParams): Promise<NYSSearchResult<NYSMember> | null> => {
    return makeApiCall<NYSSearchResult<NYSMember>>('searchMembers', params);
  }, [makeApiCall]);

  const getCalendar = useCallback(async (year: number, calendarNumber: number): Promise<NYSCalendar | null> => {
    return makeApiCall<NYSCalendar>('getCalendar', { year, calendarNumber });
  }, [makeApiCall]);

  const listCalendars = useCallback(async (year: number, limit = 50, offset = 0): Promise<NYSSearchResult<NYSCalendar> | null> => {
    return makeApiCall<NYSSearchResult<NYSCalendar>>('listCalendars', { year, limit, offset });
  }, [makeApiCall]);

  const listLaws = useCallback(async (): Promise<NYSSearchResult<NYSLaw> | null> => {
    return makeApiCall<NYSSearchResult<NYSLaw>>('listLaws');
  }, [makeApiCall]);

  const getLaw = useCallback(async (lawId: string): Promise<NYSLaw | null> => {
    return makeApiCall<NYSLaw>('getLaw', { lawId });
  }, [makeApiCall]);

  const searchLaws = useCallback(async (params: SearchParams & { lawId?: string }): Promise<NYSSearchResult<any> | null> => {
    return makeApiCall<NYSSearchResult<any>>('searchLaws', params);
  }, [makeApiCall]);

  return {
    loading,
    error,
    getBill,
    searchBills,
    getBillUpdates,
    getAgenda,
    listAgendas,
    getCommitteeMeetings,
    getMember,
    listMembers,
    searchMembers,
    getCalendar,
    listCalendars,
    listLaws,
    getLaw,
    searchLaws,
  };
};