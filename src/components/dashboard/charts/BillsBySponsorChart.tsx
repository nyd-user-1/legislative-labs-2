
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useBillsBySponsorData } from "@/hooks/dashboard/useBillsBySponsorData";

interface BillsBySponsorChartProps {
  timePeriod: string;
}

export const BillsBySponsorChart = ({ timePeriod }: BillsBySponsorChartProps) => {
  const { data, loading } = useBillsBySponsorData(timePeriod);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          type="number"
          className="text-muted-foreground"
          tick={{ fontSize: 11 }}
          tickMargin={8}
        />
        <YAxis 
          type="category"
          dataKey="sponsor"
          className="text-muted-foreground"
          tick={{ fontSize: 11 }}
          tickMargin={8}
          width={80}
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
          dataKey="bills" 
          fill="#3b82f6"
          name="Total Bills"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
