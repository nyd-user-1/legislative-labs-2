
import { useState, useEffect } from "react";
import { useNYSLegislation } from "@/hooks/useNYSLegislation";

interface BillTextState {
  billText: string;
  loading: boolean;
  error: string | null;
}

export const useNYSBillText = (billNumber: string) => {
  const [state, setState] = useState<BillTextState>({
    billText: "",
    loading: false,
    error: null
  });
  
  const { searchNYSData } = useNYSLegislation();

  useEffect(() => {
    const fetchBillText = async () => {
      if (!billNumber) return;
      
      try {
        setState(prev => ({ ...prev, loading: true, error: null, billText: "" }));
        
        console.log('Fetching NYS bill text for bill number:', billNumber);
        
        // Search for the specific bill using NYS API
        const searchResult = await searchNYSData({
          searchType: 'bills',
          query: billNumber,
          sessionYear: new Date().getFullYear(), // Current year
          limit: 1
        });
        
        if (!searchResult?.result?.items?.length) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: "Bill not found in NYS legislation database" 
          }));
          return;
        }
        
        const bill = searchResult.result.items[0];
        console.log('Found NYS bill:', bill);
        
        // Extract bill text from the amendments (full text)
        let billTextContent = "";
        
        if (bill.amendments?.items) {
          // Get the active version or latest amendment
          const activeVersion = bill.activeVersion || Object.keys(bill.amendments.items)[0];
          const amendment = bill.amendments.items[activeVersion];
          
          if (amendment?.fullText) {
            billTextContent = amendment.fullText;
          }
        }
        
        if (!billTextContent) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: "Bill text content not available for this legislation" 
          }));
          return;
        }
        
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          billText: billTextContent 
        }));
        
        console.log('Successfully fetched NYS bill text, length:', billTextContent.length);
        
      } catch (err) {
        console.error("Error fetching NYS bill text:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: `Failed to load NYS bill text: ${errorMessage}` 
        }));
      }
    };

    fetchBillText();
  }, [billNumber, searchNYSData]);

  return state;
};
