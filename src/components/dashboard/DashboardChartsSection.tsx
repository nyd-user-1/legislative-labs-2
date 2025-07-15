import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BillSponsorData {
  bill_title: string;
  sponsor_count: number;
  bill_number: string;
}

interface MemberBillData {
  member_name: string;
  bill_count: number;
  chamber: string;
}

export const DashboardChartsSection = () => {
  const [currentChart, setCurrentChart] = useState(0);
  const [billsSponsorData, setBillsSponsorData] = useState<BillSponsorData[]>([]);
  const [memberBillData, setMemberBillData] = useState<MemberBillData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChartsData = async () => {
    try {
      setLoading(true);

      // Fetch top 50 bills by number of sponsors
      const { data: billsWithSponsors } = await supabase
        .from("Bills")
        .select(`
          bill_id,
          title,
          bill_number
        `)
        .not("title", "is", null)
        .limit(200);

      if (billsWithSponsors) {
        const billsWithSponsorCounts = await Promise.all(
          billsWithSponsors.map(async (bill) => {
            const { count } = await supabase
              .from("Sponsors")
              .select("*", { count: "exact", head: true })
              .eq("bill_id", bill.bill_id);

            return {
              bill_title: bill.title?.substring(0, 50) + "..." || "Untitled Bill",
              sponsor_count: count || 0,
              bill_number: bill.bill_number || "N/A"
            };
          })
        );

        // Sort by sponsor count and take top 50
        const sortedBills = billsWithSponsorCounts
          .sort((a, b) => b.sponsor_count - a.sponsor_count)
          .slice(0, 50);
        
        setBillsSponsorData(sortedBills);
      }

      // Fetch top 50 members by number of bills
      const { data: membersData } = await supabase
        .from("People")
        .select("people_id, name, chamber")
        .not("name", "is", null)
        .limit(200);

      if (membersData) {
        const membersWithBillCounts = await Promise.all(
          membersData.map(async (member) => {
            const { count } = await supabase
              .from("Sponsors")
              .select("*", { count: "exact", head: true })
              .eq("people_id", member.people_id);

            return {
              member_name: member.name || "Unknown",
              bill_count: count || 0,
              chamber: member.chamber || "Unknown"
            };
          })
        );

        // Sort by bill count and take top 50
        const sortedMembers = membersWithBillCounts
          .sort((a, b) => b.bill_count - a.bill_count)
          .slice(0, 50);
        
        setMemberBillData(sortedMembers);
      }

    } catch (error) {
      console.error("Error fetching charts data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartsData();
  }, []);

  const charts = [
    {
      id: "bills-sponsors-bar",
      title: "Bar Chart - Interactive",
      description: "Top 50 bills by number of sponsors",
      type: "bar" as const
    },
    {
      id: "bills-sponsors-area", 
      title: "Area Chart - Interactive",
      description: "Top 50 bills by number of sponsors",
      type: "area" as const
    },
    {
      id: "members-bills-bar",
      title: "Bar Chart",
      description: "Most number of bills by individual members, top 50",
      type: "member-bar" as const
    }
  ];

  const nextChart = () => {
    setCurrentChart((prev) => (prev + 1) % charts.length);
  };

  const prevChart = () => {
    setCurrentChart((prev) => (prev - 1 + charts.length) % charts.length);
  };

  const goToChart = (index: number) => {
    setCurrentChart(index);
  };

  const renderChart = () => {
    const chart = charts[currentChart];
    
    if (loading) {
      return (
        <div className="h-[400px] w-full flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
        </div>
      );
    }

    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={billsSponsorData.slice(0, 15)} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barCategoryGap="5%"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="bill_number" 
                className="text-muted-foreground"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [value, "Sponsors"]}
                labelFormatter={(label) => `Bill: ${label}`}
              />
              <Bar 
                dataKey="sponsor_count" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={billsSponsorData.slice(0, 30)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="bill_number" 
                className="text-muted-foreground"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [value, "Sponsors"]}
                labelFormatter={(label) => `Bill: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="sponsor_count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "member-bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={memberBillData.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="member_name" 
                className="text-muted-foreground"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [value, "Bills Sponsored"]}
                labelFormatter={(label) => `Member: ${label}`}
              />
              <Bar 
                dataKey="bill_count" 
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{charts[currentChart].title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevChart}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextChart}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-sm">
          {charts[currentChart].description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <div className="relative">
          {/* Chart Container with horizontal scroll simulation */}
          <div className="w-full overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentChart * 100}%)` }}
            >
              {charts.map((_, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  {index === currentChart && renderChart()}
                </div>
              ))}
            </div>
          </div>
          
          {/* Chart Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {charts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToChart(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentChart 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to chart ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};