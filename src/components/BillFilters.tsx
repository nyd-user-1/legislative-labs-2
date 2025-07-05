import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface BillFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    status: string;
    committee: string;
    dateRange: string;
  }) => void;
  committees: string[];
}

export const BillFilters = ({ onFiltersChange, committees }: BillFiltersProps) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    committee: "all",
    dateRange: "all"
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Convert "all" back to empty strings when passing to parent
    const filtersForParent = {
      ...newFilters,
      status: newFilters.status === "all" ? "" : newFilters.status,
      committee: newFilters.committee === "all" ? "" : newFilters.committee,
      dateRange: newFilters.dateRange === "all" ? "" : newFilters.dateRange,
    };
    onFiltersChange(filtersForParent);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      status: "all",
      committee: "all",
      dateRange: "all"
    };
    setFilters(emptyFilters);
    
    // Convert "all" back to empty strings when passing to parent
    const filtersForParent = {
      search: "",
      status: "",
      committee: "",
      dateRange: ""
    };
    onFiltersChange(filtersForParent);
  };

  const hasActiveFilters = filters.search !== "" || 
    (filters.status !== "all" && filters.status !== "") ||
    (filters.committee !== "all" && filters.committee !== "") ||
    (filters.dateRange !== "all" && filters.dateRange !== "");

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Bills
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Bills</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by title, number, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="1">Introduced</SelectItem>
                <SelectItem value="2">Committee</SelectItem>
                <SelectItem value="3">Floor</SelectItem>
                <SelectItem value="4">Passed</SelectItem>
                <SelectItem value="5">Failed</SelectItem>
                <SelectItem value="6">Signed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Committee</Label>
            <Select value={filters.committee} onValueChange={(value) => handleFilterChange("committee", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Committees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Committees</SelectItem>
                {committees.map((committee) => (
                  <SelectItem key={committee} value={committee}>
                    {committee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};