
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

  const searchBills = async (query: string, state?: string, year?: number, page = 1) => {
    const result = await callLegiscanApi({
      operation: 'search',
      params: {
        query,
        state,
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
    const result = await callLegiscanApi({
      operation: 'getSessionList',
      params: state ? { state } : {}
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
    searchBills,
    getSessionList,
    getBill,
    getBillText,
    clearResults,
  };
};
