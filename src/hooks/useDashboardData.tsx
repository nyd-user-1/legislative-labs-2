
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
  activeChats: number;
  totalCommittees: number;
  totalMembers: number;
}

interface ChartDataPoint {
  period: string;
  assembly: number;
  senate: number;
}

export const useDashboardData = (timePeriod: string = "Month") => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0,
    activeChats: 0,
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

      // Fetch active chats count (user-specific)
      const { count: activeChatsCount } = await supabase
        .from("chat_sessions")
        .select("*", { count: "exact", head: true });

      setStats({
        totalBills: billsResponse.count || 0,
        activeChats: activeChatsCount || 0,
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

      // Generate chart data based on real Supabase data
      const generateChartData = async () => {
        const periods = [];
        const now = new Date();
        let periodsToShow = 6;
        let dateFormat: Intl.DateTimeFormatOptions = { month: 'short' };
        let intervalDays = 30;

        if (timePeriod === "Week") {
          periodsToShow = 7;
          dateFormat = { weekday: 'short' };
          intervalDays = 1;
        } else if (timePeriod === "Year") {
          periodsToShow = 5;
          dateFormat = { year: 'numeric' };
          intervalDays = 365;
        }

        for (let i = periodsToShow - 1; i >= 0; i--) {
          const date = new Date(now);
          
          if (timePeriod === "Week") {
            date.setDate(date.getDate() - i);
          } else if (timePeriod === "Month") {
            date.setMonth(date.getMonth() - i);
          } else if (timePeriod === "Year") {
            date.setFullYear(date.getFullYear() - i);
          }

          // Calculate date range for this period
          const startDate = new Date(date);
          const endDate = new Date(date);
          
          if (timePeriod === "Week") {
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
          } else if (timePeriod === "Month") {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            endDate.setHours(23, 59, 59, 999);
          } else if (timePeriod === "Year") {
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate.setMonth(11, 31);
            endDate.setHours(23, 59, 59, 999);
          }

          // Query bills in this date range
          const { data: billsInPeriod } = await supabase
            .from("Bills")
            .select("bill_number")
            .gte("last_action_date", startDate.toISOString().split('T')[0])
            .lte("last_action_date", endDate.toISOString().split('T')[0]);

          const totalBills = billsInPeriod?.length || 0;
          
          // Approximate split between Assembly and Senate bills
          // Assembly bills typically start with 'A', Senate bills with 'S'
          const assemblyBills = billsInPeriod?.filter(bill => 
            bill.bill_number?.toUpperCase().startsWith('A')
          ).length || 0;
          const senateBills = totalBills - assemblyBills;

          periods.push({
            period: date.toLocaleDateString('en-US', dateFormat),
            assembly: assemblyBills,
            senate: senateBills,
          });
        }
        
        return periods;
      };

      const chartData = await generateChartData();
      setChartData(chartData);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  return {
    stats,
    recentBills,
    chartData,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
