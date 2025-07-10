
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useBillsByMonthData } from "@/hooks/dashboard/useBillsByMonthData";

interface BillsByMonthChartProps {
  timePeriod: string;
}

export const BillsByMonthChart = ({ timePeriod }: BillsByMonthChartProps) => {
  const { data, loading } = useBillsByMonthData(timePeriod);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="text-muted-foreground"
          tick={{ fontSize: 11 }}
          tickMargin={8}
        />
        <YAxis 
          className="text-muted-foreground"
          tick={{ fontSize: 11 }}
          tickMargin={8}
          width={40}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            fontSize: '12px'
          }}
        />
        <Bar 
          dataKey="assembly" 
          fill="#93c5fd"
          name="Assembly"
        />
        <Bar 
          dataKey="senate" 
          fill="#3b82f6"
          name="Senate"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
