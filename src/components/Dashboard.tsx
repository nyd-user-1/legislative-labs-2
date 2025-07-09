import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, FileText, Users, Building2, TrendingUp, Calendar, Eye } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { BillsTable } from "@/components/dashboard/BillsTable";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Legislative Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Overview of New York State legislative activity
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                2024 Session
              </Badge>
            </div>
          </div>

          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewAllBills}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Bills</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold">{stats.totalBills.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All legislative bills
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Active Bills</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold">{stats.activeBills.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Recent activity (6 months)
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewAllCommittees}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Committees</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold">{stats.totalCommittees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Active committees
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewAllMembers}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium truncate">Legislators</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Senate & Assembly members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5" />
                <CardTitle className="text-base sm:text-lg">Legislative Activity Trend</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Number of bills introduced over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="h-[250px] sm:h-[300px] lg:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    <Line 
                      type="monotone" 
                      dataKey="bills" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bills Table Section */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                  <CardTitle className="text-base sm:text-lg">Recent Legislative Activity</CardTitle>
                </div>
                <Button variant="outline" onClick={handleViewAllBills} size="sm" className="self-start sm:self-auto">
                  View All Bills
                </Button>
              </div>
              <CardDescription className="text-sm">
                Latest bills with recent legislative activity
              </CardDescription>
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