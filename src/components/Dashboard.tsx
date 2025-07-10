
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDashboardData } from "@/hooks/useDashboardData";
import { BillsTable } from "@/components/dashboard/BillsTable";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChartCarousel } from "@/components/dashboard/ChartCarousel";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

export const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("1 Mo.");
  const { stats, recentBills, chartData, loading, error, refetch } = useDashboardData(timePeriod);
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

  const handleViewAllChats = () => {
    navigate('/chats');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Legislative Dashboard</h1>
              <p className="text-muted-foreground">
                Overview of New York State legislative activity
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overview</h1>
            </div>
          </div>

          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="hover:shadow-md hover:bg-muted/50 transition-all cursor-pointer max-w-[48dvw] sm:max-w-none" onClick={handleViewAllBills}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Bills</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-3xl sm:text-4xl font-bold">{stats.totalBills.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md hover:bg-blue-500 transition-all cursor-pointer max-w-[48dvw] sm:max-w-none bg-blue-200 text-white" onClick={handleViewAllChats}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate text-white">Active Chats</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-3xl sm:text-4xl font-bold text-white">{stats.activeChats.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md hover:bg-muted/50 transition-all cursor-pointer max-w-[48dvw] sm:max-w-none" onClick={handleViewAllCommittees}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Committees</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-3xl sm:text-4xl font-bold">{stats.totalCommittees.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md hover:bg-muted/50 transition-all cursor-pointer max-w-[48dvw] sm:max-w-none" onClick={handleViewAllMembers}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Legislators</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-3xl sm:text-4xl font-bold">{stats.totalMembers.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Carousel Section */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg">Activity</CardTitle>
                </div>
                <ToggleGroup 
                  value={timePeriod} 
                  onValueChange={(value) => value && setTimePeriod(value)}
                  type="single"
                  variant="outline"
                  size="sm"
                >
                  <ToggleGroupItem value="1 Mo." aria-label="1 month view">
                    1 Mo.
                  </ToggleGroupItem>
                  <ToggleGroupItem value="3 Mo." aria-label="3 months view">
                    3 Mo.
                  </ToggleGroupItem>
                  <ToggleGroupItem value="6 Mo." aria-label="6 months view">
                    6 Mo.
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="h-4"></div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ChartCarousel timePeriod={timePeriod} />
            </CardContent>
          </Card>

          {/* Recent Bills Table Section */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg">Recent Legislative Activity</CardTitle>
                </div>
                <Button variant="outline" onClick={handleViewAllBills} size="sm" className="self-start sm:self-auto">
                  View All Bills
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <BillsTable bills={recentBills} onBillSelect={handleBillSelect} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
