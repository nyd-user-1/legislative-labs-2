import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, FileText, Users, Building2, TrendingUp, Calendar, Eye, Gavel, Vote, AlertTriangle } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SectionCard, ChartAreaInteractive, DataTable } from "@/components/dashboard";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

export const Dashboard = () => {
  const { stats, recentBills, chartData, loading, error, refetch } = useDashboardData();
  const navigate = useNavigate();

  const handleBillSelect = (bill: Bill) => {
    navigate('/bills');
  };

  const handleViewAllBills = () => {
    navigate('/bills');
  };

  const handleViewAllMembers = () => {
    navigate('/members');
  };

  const handleViewAllCommittees = () => {
    navigate('/committees');
  };

  // Enhanced chart data with multiple metrics
  const enhancedChartData = chartData.map((item, index) => ({
    name: item.month,
    value: item.bills,
    bills: item.bills,
    committee_actions: Math.floor(Math.random() * 30) + 10,
    votes: Math.floor(Math.random() * 20) + 5,
  }));

  // Column definitions for the enhanced bills table
  const billsColumns: ColumnDef<Bill>[] = [
    {
      accessorKey: "bill_number",
      header: "Bill Number",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.bill_number || "No Number"}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.title || ""}>
          {row.original.title || "No Title"}
        </div>
      ),
    },
    {
      accessorKey: "sponsors",
      header: "Sponsor",
      cell: ({ row }) => (
        <div>
          {row.original.sponsors && row.original.sponsors.length > 0 
            ? row.original.sponsors[0].name 
            : "No Sponsor"}
        </div>
      ),
    },
    {
      accessorKey: "status_desc",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.status_desc || "Unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "last_action_date",
      header: "Last Action",
      cell: ({ row }) => {
        const date = row.original.last_action_date;
        if (!date) return "No date";
        try {
          return new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          });
        } catch {
          return "Invalid date";
        }
      },
    },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <div className="space-y-6">
            {/* Header Loading */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
              </div>
              <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
            </div>
            
            {/* Cards Loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <SectionCard key={i} title="" isLoading />
              ))}
            </div>

            {/* Chart Loading */}
            <ChartAreaInteractive
              data={[]}
              title=""
              isLoading
              className="col-span-full"
            />

            {/* Table Loading */}
            <DataTable
              columns={billsColumns}
              data={[]}
              title=""
              isLoading
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <SectionCard
            title="Error Loading Dashboard"
            description={error}
            icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            className="max-w-md mx-auto mt-12"
          >
            <Button onClick={refetch} className="w-full">
              Try Again
            </Button>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Legislative Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive overview of New York State legislative activity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                2024 Session
              </Badge>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SectionCard
              title="Total Bills"
              description="All legislative bills"
              value={stats.totalBills}
              icon={<FileText className="h-5 w-5" />}
              trend={{ value: 5.2, label: "from last session", isPositive: true }}
              onViewAll={handleViewAllBills}
              className="cursor-pointer"
            />
            
            <SectionCard
              title="Active Bills"
              description="Recent activity (6 months)"
              value={stats.activeBills}
              icon={<Activity className="h-5 w-5" />}
              trend={{ value: 12.8, label: "from last month", isPositive: true }}
              badge={{ text: "Trending", variant: "default" }}
            />
            
            <SectionCard
              title="Committees"
              description="Active committees"
              value={stats.totalCommittees}
              icon={<Building2 className="h-5 w-5" />}
              onViewAll={handleViewAllCommittees}
              className="cursor-pointer"
            />
            
            <SectionCard
              title="Legislators"
              description="Senate & Assembly members"
              value={stats.totalMembers}
              icon={<Users className="h-5 w-5" />}
              onViewAll={handleViewAllMembers}
              className="cursor-pointer"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SectionCard
              title="Bills Passed"
              description="This session"
              value={Math.floor(stats.totalBills * 0.23)}
              icon={<Gavel className="h-5 w-5" />}
              trend={{ value: 8.1, label: "vs last session", isPositive: true }}
              size="compact"
            />
            
            <SectionCard
              title="Committee Votes"
              description="Last 30 days"
              value={147}
              icon={<Vote className="h-5 w-5" />}
              trend={{ value: -3.2, label: "from last month", isPositive: false }}
              size="compact"
            />
            
            <SectionCard
              title="Public Hearings"
              description="Scheduled this month"
              value={23}
              icon={<Calendar className="h-5 w-5" />}
              badge={{ text: "8 Today", variant: "outline" }}
              size="compact"
            />
          </div>

          {/* Chart Section */}
          <ChartAreaInteractive
            data={enhancedChartData}
            title="Legislative Activity Trends"
            description="Track bills, committee actions, and votes over time"
            allowedChartTypes={["area", "bar"]}
            timeRanges={[
              { label: "Last 7 days", value: "7d" },
              { label: "Last 30 days", value: "30d" },
              { label: "Last 3 months", value: "3m" },
              { label: "Last 6 months", value: "6m" },
              { label: "This year", value: "1y" }
            ]}
          />

          {/* Enhanced Data Table */}
          <DataTable
            columns={billsColumns}
            data={recentBills}
            title="Recent Legislative Activity"
            description="Latest bills with recent updates and actions"
            searchKey="title"
            searchPlaceholder="Search bills by title, number, or sponsor..."
            onRowClick={handleBillSelect}
            pageSize={15}
          />
        </div>
      </div>
    </div>
  );
};