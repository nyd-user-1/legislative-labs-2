
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyData {
  month: string;
  assembly: number;
  senate: number;
}

export const useBillsByMonthData = (timePeriod: string) => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Calculate months based on period
        let monthsToShow = 1;
        if (timePeriod === "3 Mo.") monthsToShow = 3;
        if (timePeriod === "6 Mo.") monthsToShow = 6;

        const now = new Date();
        const monthsData: MonthlyData[] = [];

        for (let i = monthsToShow - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          
          const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          // Query bills in this month
          const { data: billsData } = await supabase
            .from("Bills")
            .select("bill_number")
            .gte("last_action_date", startDate.toISOString().split('T')[0])
            .lte("last_action_date", endDate.toISOString().split('T')[0]);

          const assemblyBills = billsData?.filter(bill => 
            bill.bill_number?.toUpperCase().startsWith('A')
          ).length || 0;
          
          const senateBills = billsData?.filter(bill => 
            bill.bill_number?.toUpperCase().startsWith('S')
          ).length || 0;

          monthsData.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            assembly: assemblyBills,
            senate: senateBills,
          });
        }

        setData(monthsData);
      } catch (error) {
        console.error("Error fetching bills by month data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  return { data, loading };
};
