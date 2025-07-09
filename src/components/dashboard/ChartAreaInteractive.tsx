import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", assembly: 32, senate: 28 },
  { month: "Feb", assembly: 45, senate: 38 },
  { month: "Mar", assembly: 38, senate: 42 },
  { month: "Apr", assembly: 52, senate: 35 },
  { month: "May", assembly: 41, senate: 47 },
  { month: "Jun", assembly: 48, senate: 39 },
];

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = useState("3months");

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-col @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
        <div className="space-y-1">
          <CardTitle>Legislative Activity</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Bill introductions for the last 3 months
            </span>
            <span className="@[540px]/card:hidden">Last 3 months</span>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7days")}
          >
            Last 7 days
          </Button>
          <Button
            variant={timeRange === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("30days")}
          >
            Last 30 days
          </Button>
          <Button
            variant={timeRange === "3months" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("3months")}
          >
            Last 3 months
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Area 
                type="monotone" 
                dataKey="assembly" 
                stackId="1"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="senate" 
                stackId="1"
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.4}
                dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}