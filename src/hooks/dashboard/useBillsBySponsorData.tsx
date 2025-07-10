
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SponsorData {
  sponsor: string;
  bills: number;
}

export const useBillsBySponsorData = (timePeriod: string) => {
  const [data, setData] = useState<SponsorData[]>([]);
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

        // Get sponsors with bill counts
        const { data: sponsorsData } = await supabase
          .from("Sponsors")
          .select(`
            people_id,
            People!inner(name)
          `);

        if (sponsorsData) {
          // Count bills per sponsor
          const sponsorCounts: { [key: string]: number } = {};
          
          sponsorsData.forEach(sponsor => {
            if (sponsor.People?.name) {
              sponsorCounts[sponsor.People.name] = (sponsorCounts[sponsor.People.name] || 0) + 1;
            }
          });

          // Convert to chart format and get top 6
          const chartData = Object.entries(sponsorCounts)
            .map(([sponsor, bills]) => ({ sponsor, bills }))
            .sort((a, b) => b.bills - a.bills)
            .slice(0, 6);

          setData(chartData);
        }
      } catch (error) {
        console.error("Error fetching bills by sponsor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  return { data, loading };
};
