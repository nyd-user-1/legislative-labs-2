import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Calendar, Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartAreaInteractiveProps {
  data: ChartData[];
  title: string;
  description?: string;
  className?: string;
  allowedChartTypes?: ("line" | "area" | "bar" | "pie")[];
  timeRanges?: { label: string; value: string; }[];
  isLoading?: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const ChartAreaInteractive = ({
  data,
  title,
  description,
  className,
  allowedChartTypes = ["line", "area", "bar"],
  timeRanges = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
    { label: "Last year", value: "1y" }
  ],
  isLoading = false
}: ChartAreaInteractiveProps) => {
  const [chartType, setChartType] = useState<"line" | "area" | "bar" | "pie">(allowedChartTypes[0] || "line");
  const [timeRange, setTimeRange] = useState(timeRanges[1]?.value || "30d");

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded animate-pulse">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      );
    }

    const chartProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
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
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
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
                dataKey="value" 
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

      default: // line
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
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
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case "area":
      case "line":
        return <TrendingUp className="h-4 w-4" />;
      case "bar":
        return <BarChart3 className="h-4 w-4" />;
      case "pie":
        return <PieChartIcon className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                {allowedChartTypes.map((type) => (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                    {getChartIcon(type)}
                    <span className="capitalize hidden sm:inline">{type}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart Area */}
          <div className="w-full">
            {renderChart()}
          </div>

          {/* Chart Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">
                {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Average</p>
              <p className="text-2xl font-bold">
                {Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Highest</p>
              <p className="text-2xl font-bold">
                {Math.max(...data.map(item => item.value)).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Period</p>
              <Badge variant="outline" className="text-xs">
                {timeRanges.find(r => r.value === timeRange)?.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};