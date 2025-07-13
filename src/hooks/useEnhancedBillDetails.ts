
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedBillDetails {
  basePrintNo: string;
  session: number;
  printNo: string;
  billType: {
    chamber: string;
    desc: string;
    resolution: boolean;
  };
  title: string;
  summary?: string;
  status: {
    statusType: string;
    statusDesc: string;
    actionDate: string;
    committeeName?: string;
    billCalNo?: number;
  };
  sponsor?: {
    member: {
      memberId: number;
      shortName: string;
      fullName: string;
      districtCode: number;
    };
    budget: boolean;
    rules: boolean;
  };
  coSponsors: Array<{
    member: {
      memberId: number;
      shortName: string;
      fullName: string;
      districtCode: number;
    };
  }>;
  activeVersion: string;
  amendments: Record<string, any>;
  votes: Array<any>;
  actions: Array<{
    date: string;
    chamber: string;
    text: string;
    billId: {
      basePrintNo: string;
      session: number;
      version: string;
    };
  }>;
  publishedDateTime: string;
  substitutedBy?: any;
  previousVersions: Array<any>;
}

export const useEnhancedBillDetails = () => {
  const [loading, setLoading] = useState(false);
  const [enhancedDetails, setEnhancedDetails] = useState<EnhancedBillDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEnhancedDetails = async (billNumber: string, sessionYear?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-bill-details', {
        body: { billNumber, sessionYear }
      });

      if (error) {
        console.error('Enhanced bill details error:', error);
        setError('Failed to fetch enhanced bill details');
        toast({
          title: "Error",
          description: "Failed to fetch enhanced bill details from NYS API",
          variant: "destructive",
        });
        return null;
      }

      if (data?.success && data?.result) {
        setEnhancedDetails(data.result);
        return data.result;
      } else {
        setError(data?.error || 'No enhanced details found');
        return null;
      }
    } catch (error) {
      console.error('Enhanced bill details error:', error);
      setError('Failed to fetch enhanced bill details');
      toast({
        title: "Error",
        description: "Failed to fetch enhanced bill details",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    enhancedDetails,
    error,
    fetchEnhancedDetails,
  };
};
