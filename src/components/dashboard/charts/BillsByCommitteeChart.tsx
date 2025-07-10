
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useBillsByCommitteeData } from "@/hooks/dashboard/useBillsByCommitteeData";

interface BillsByCommitteeChartProps {
  timePeriod: string;
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export const BillsByCommitteeChart = ({ timePeriod }: BillsByCommitteeChartProps) => {
  const { data, loading } = useBillsByCommitteeData(timePeriod);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="bills"
          nameKey="committee"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            fontSize: '12px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
