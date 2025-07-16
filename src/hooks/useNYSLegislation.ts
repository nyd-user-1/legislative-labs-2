
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NYSApiParams {
  searchType: 'bills' | 'members' | 'laws' | 'agendas' | 'calendars';
  query: string;
  sessionYear?: number;
  limit?: number;
}

export const useNYSLegislation = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const { toast } = useToast();

  const searchNYSData = async (params: NYSApiParams) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('nys-legislation-search', {
        body: params
      });

      if (error || !data || !data.success) {
        console.error('NYS API error:', error || data?.error);
        toast({
          title: "NYS API Error",
          description: error?.message || data?.error || "Failed to search NYS legislation",
          variant: "destructive",
        });
        return null;
      }

      setSearchResults(data);
      return data;
    } catch (error) {
      console.error('NYS API error:', error);
      toast({
        title: "API Error",
        description: "Failed to call NYS Legislation API",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setSearchResults(null);
  };

  return {
    loading,
    searchResults,
    searchNYSData,
    clearResults,
  };
};
