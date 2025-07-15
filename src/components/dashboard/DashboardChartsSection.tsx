import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

interface MemberNoVoteData {
  member_name: string;
  no_vote_count: number;
  chamber: string;
}

export const DashboardChartsSection = () => {
  const [currentChart, setCurrentChart] = useState(0);
  const [billsSponsorData, setBillsSponsorData] = useState<BillSponsorData[]>([]);
  const [memberBillData, setMemberBillData] = useState<MemberBillData[]>([]);
  const [memberNoVoteData, setMemberNoVoteData] = useState<MemberNoVoteData[]>([]);
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

      // Fetch no votes by member
      const { data: votesData } = await supabase
        .from("Votes")
        .select("people_id, vote_desc")
        .in("vote_desc", ["Nay", "No", "NAY", "NO"])
        .limit(1000);

      if (votesData) {
        // Group votes by people_id
        const votesByMember = votesData.reduce((acc, vote) => {
          if (vote.people_id) {
            acc[vote.people_id] = (acc[vote.people_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<number, number>);

        // Get member details for people with no votes
        const memberIds = Object.keys(votesByMember).map(id => parseInt(id));
        const { data: noVoteMembersData } = await supabase
          .from("People")
          .select("people_id, name, chamber")
          .in("people_id", memberIds)
          .not("name", "is", null);

        if (noVoteMembersData) {
          const membersWithNoVotes = noVoteMembersData.map(member => ({
            member_name: member.name || "Unknown",
            no_vote_count: votesByMember[member.people_id] || 0,
            chamber: member.chamber || "Unknown"
          }));

          // Sort by no vote count and take top 50
          const sortedNoVoteMembers = membersWithNoVotes
            .sort((a, b) => b.no_vote_count - a.no_vote_count)
            .slice(0, 50);
          
          setMemberNoVoteData(sortedNoVoteMembers);
        }
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
    },
    {
      id: "members-no-votes-bar",
      title: "Bar Chart - No Votes",
      description: "Members with most no votes, top 50",
      type: "no-votes-bar" as const
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

    // Chart configurations
    const billsSponsorChartConfig = {
      sponsor_count: {
        label: "Sponsors",
        color: "#3b82f6",
      },
    } satisfies ChartConfig;

    const memberBillChartConfig = {
      bill_count: {
        label: "Bills Sponsored",
        color: "#93c5fd",
      },
    } satisfies ChartConfig;

    const memberNoVoteChartConfig = {
      no_vote_count: {
        label: "No Votes",
        color: "#1e40af",
      },
    } satisfies ChartConfig;

    switch (chart.type) {
      case "bar":
        return (
          <ChartContainer config={billsSponsorChartConfig}>
            <BarChart data={billsSponsorData.slice(0, 20)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="bill_number" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar 
                dataKey="sponsor_count" 
                fill="var(--color-sponsor_count)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        );

      case "area":
        return (
          <ChartContainer config={billsSponsorChartConfig}>
            <AreaChart data={billsSponsorData.slice(0, 30)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="bill_number" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Area 
                type="monotone" 
                dataKey="sponsor_count" 
                stroke="var(--color-sponsor_count)" 
                strokeWidth={2}
                fill="var(--color-sponsor_count)"
                fillOpacity={0.2}
                dot={{ fill: "var(--color-sponsor_count)", strokeWidth: 2, r: 3 }}
              />
            </AreaChart>
          </ChartContainer>
        );

      case "member-bar":
        return (
          <ChartContainer config={memberBillChartConfig}>
            <BarChart data={memberBillData.slice(0, 20)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="member_name" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar 
                dataKey="bill_count" 
                fill="var(--color-bill_count)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        );

      case "no-votes-bar":
        return (
          <ChartContainer config={memberNoVoteChartConfig}>
            <BarChart data={memberNoVoteData.slice(0, 20)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="member_name" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar 
                dataKey="no_vote_count" 
                fill="var(--color-no_vote_count)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
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
      
      <CardContent className="p-0">
        <div className="relative">
          {/* Chart Container with horizontal scroll simulation */}
          <div className="w-full overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentChart * 100}%)` }}
            >
              {charts.map((_, index) => (
                <div key={index} className="w-full flex-shrink-0 p-1">
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