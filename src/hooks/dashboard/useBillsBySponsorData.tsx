
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

        // First, get all sponsors
        const { data: sponsorsData, error: sponsorsError } = await supabase
          .from("Sponsors")
          .select("people_id");

        if (sponsorsError) {
          console.error("Error fetching sponsors:", sponsorsError);
          return;
        }

        if (sponsorsData && sponsorsData.length > 0) {
          // Get unique people IDs
          const peopleIds = [...new Set(sponsorsData.map(s => s.people_id).filter(Boolean))];
          
          // Fetch people data separately
          const { data: peopleData, error: peopleError } = await supabase
            .from("People")
            .select("people_id, name")
            .in("people_id", peopleIds);

          if (peopleError) {
            console.error("Error fetching people:", peopleError);
            return;
          }

          if (peopleData) {
            // Count bills per sponsor
            const sponsorCounts: { [key: string]: number } = {};
            
            sponsorsData.forEach(sponsor => {
              const person = peopleData.find(p => p.people_id === sponsor.people_id);
              if (person?.name) {
                sponsorCounts[person.name] = (sponsorCounts[person.name] || 0) + 1;
              }
            });

            // Convert to chart format and get top 6
            const chartData = Object.entries(sponsorCounts)
              .map(([sponsor, bills]) => ({ sponsor, bills }))
              .sort((a, b) => b.bills - a.bills)
              .slice(0, 6);

            setData(chartData);
          }
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
