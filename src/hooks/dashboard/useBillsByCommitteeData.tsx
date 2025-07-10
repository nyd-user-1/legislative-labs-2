
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CommitteeData {
  committee: string;
  bills: number;
}

export const useBillsByCommitteeData = (timePeriod: string) => {
  const [data, setData] = useState<CommitteeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Calculate date range based on period
        let monthsBack = 1;
        if (timePeriod === "3 Mo.") monthsBack = 3;
        if (timePeriod === "6 Mo.") monthsBack = 6;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);

        // Get bills with committee information
        const { data: billsData } = await supabase
          .from("Bills")
          .select("committee")
          .not("committee", "is", null)
          .gte("last_action_date", startDate.toISOString().split('T')[0]);

        if (billsData) {
          // Count bills per committee
          const committeeCounts: { [key: string]: number } = {};
          
          billsData.forEach(bill => {
            if (bill.committee) {
              committeeCounts[bill.committee] = (committeeCounts[bill.committee] || 0) + 1;
            }
          });

          // Convert to chart format and get top 5
          const chartData = Object.entries(committeeCounts)
            .map(([committee, bills]) => ({ committee, bills }))
            .sort((a, b) => b.bills - a.bills)
            .slice(0, 5);

          setData(chartData);
        }
      } catch (error) {
        console.error("Error fetching bills by committee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  return { data, loading };
};
