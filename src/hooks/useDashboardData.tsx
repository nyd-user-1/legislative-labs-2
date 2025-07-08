import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface DashboardStats {
  totalBills: number;
  activeBills: number;
  totalCommittees: number;
  totalMembers: number;
}

interface ChartDataPoint {
  month: string;
  bills: number;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0,
    activeBills: 0,
    totalCommittees: 0,
    totalMembers: 0,
  });
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const [billsResponse, committeesResponse, membersResponse] = await Promise.all([
        supabase.from("Bills").select("*", { count: "exact", head: true }),
        supabase.from("Committees").select("*", { count: "exact", head: true }),
        supabase.from("People").select("*", { count: "exact", head: true }),
      ]);

      // Fetch active bills (bills with recent activity)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const { count: activeBillsCount } = await supabase
        .from("Bills")
        .select("*", { count: "exact", head: true })
        .gte("last_action_date", sixMonthsAgo.toISOString().split('T')[0]);

      setStats({
        totalBills: billsResponse.count || 0,
        activeBills: activeBillsCount || 0,
        totalCommittees: committeesResponse.count || 0,
        totalMembers: membersResponse.count || 0,
      });

      // Fetch recent bills with sponsors
      const { data: billsData } = await supabase
        .from("Bills")
        .select("*")
        .not("last_action_date", "is", null)
        .order("last_action_date", { ascending: false })
        .limit(10);

      if (billsData) {
        const billsWithSponsors = await Promise.all(
          billsData.map(async (bill) => {
            const { data: sponsorsData } = await supabase
              .from("Sponsors")
              .select("people_id, position")
              .eq("bill_id", bill.bill_id)
              .order("position", { ascending: true })
              .limit(3);

            let sponsors: Array<{ name: string | null; party: string | null; chamber: string | null; }> = [];
            
            if (sponsorsData && sponsorsData.length > 0) {
              const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);
              if (peopleIds.length > 0) {
                const { data: peopleData } = await supabase
                  .from("People")
                  .select("people_id, name, party, chamber")
                  .in("people_id", peopleIds);
                
                sponsors = sponsorsData.map(sponsor => {
                  const person = peopleData?.find(p => p.people_id === sponsor.people_id);
                  return {
                    name: person?.name || null,
                    party: person?.party || null,
                    chamber: person?.chamber || null
                  };
                }).filter(s => s.name);
              }
            }

            return { ...bill, sponsors };
          })
        );

        setRecentBills(billsWithSponsors);
      }

      // Generate chart data (mock data for now - in real implementation would fetch from database)
      const generateChartData = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          months.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            bills: Math.floor(Math.random() * 50) + 20,
          });
        }
        return months;
      };

      setChartData(generateChartData());

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentBills,
    chartData,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};