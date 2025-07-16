
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LegiscanSearchResult, LegiscanSessionList, LegiscanApiParams } from "@/types/legiscan";

export const useLegiscan = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LegiscanSearchResult | null>(null);
  const [sessions, setSessions] = useState<LegiscanSessionList | null>(null);
  const { toast } = useToast();

  const callLegiscanApi = async (params: LegiscanApiParams) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('legiscan-search', {
        body: params
      });

      if (error) {
        console.error('Legiscan API error:', error);
        toast({
          title: "API Error",
          description: "Failed to call Legiscan API",
          variant: "destructive",
        });
        return null;
      }

      if (data?.status === 'ERROR') {
        toast({
          title: "Legiscan Error",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Legiscan API error:', error);
      toast({
        title: "API Error",
        description: "Failed to call Legiscan API",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ALL SEARCHES RESTRICTED TO NY ONLY
  const searchBills = async (query: string, year?: number, page = 1) => {
    console.log('Searching bills - RESTRICTED TO NY ONLY');
    const result = await callLegiscanApi({
      operation: 'search',
      params: {
        query,
        state: 'NY', // ALWAYS restrict to NY
        year,
        page
      }
    });

    if (result) {
      setSearchResults(result);
    }

    return result;
  };

  // SPECIAL METHOD FOR AI CHAT ONLY - allows all states for similar bills analysis
  const searchSimilarBills = async (query: string, year?: number, page = 1) => {
    console.log('AI Chat: Searching similar bills across all states for analysis');
    const result = await callLegiscanApi({
      operation: 'search',
      params: {
        query,
        // Allow all states for AI chat similar bills analysis
        state: undefined,
        year,
        page
      }
    });

    if (result) {
      setSearchResults(result);
    }

    return result;
  };

  const getSessionList = async (state?: string) => {
    // ALWAYS default to NY
    const targetState = 'NY';
    console.log('Getting session list - RESTRICTED TO NY ONLY');
    
    const result = await callLegiscanApi({
      operation: 'getSessionList',
      params: { state: targetState }
    });

    if (result) {
      setSessions(result);
    }

    return result;
  };

  const getBill = async (billId: number) => {
    return await callLegiscanApi({
      operation: 'getBill',
      params: { id: billId }
    });
  };

  const getBillText = async (billId: number) => {
    return await callLegiscanApi({
      operation: 'getBillText',
      params: { id: billId }
    });
  };

  const clearResults = () => {
    setSearchResults(null);
    setSessions(null);
  };

  return {
    loading,
    searchResults,
    sessions,
    searchBills, // NY ONLY
    searchSimilarBills, // AI Chat exception - all states for similar bills analysis
    getSessionList, // NY ONLY
    getBill,
    getBillText,
    clearResults,
  };
};
