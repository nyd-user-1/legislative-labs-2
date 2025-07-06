import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface BillFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    sponsor: string;
    committee: string;
    dateRange: string;
  }) => void;
  committees: string[];
  sponsors: string[];
}

export const BillFilters = ({ onFiltersChange, committees, sponsors }: BillFiltersProps) => {
  const [filters, setFilters] = useState({
    search: "",
    sponsor: "all",
    committee: "all",
    dateRange: "all"
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Convert "all" back to empty strings when passing to parent
    const filtersForParent = {
      ...newFilters,
      sponsor: newFilters.sponsor === "all" ? "" : newFilters.sponsor,
      committee: newFilters.committee === "all" ? "" : newFilters.committee,
      dateRange: newFilters.dateRange === "all" ? "" : newFilters.dateRange,
    };
    onFiltersChange(filtersForParent);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      sponsor: "all",
      committee: "all",
      dateRange: "all"
    };
    setFilters(emptyFilters);
    
    // Convert "all" back to empty strings when passing to parent
    const filtersForParent = {
      search: "",
      sponsor: "",
      committee: "",
      dateRange: ""
    };
    onFiltersChange(filtersForParent);
  };

  const hasActiveFilters = filters.search !== "" || 
    (filters.sponsor !== "all" && filters.sponsor !== "") ||
    (filters.committee !== "all" && filters.committee !== "") ||
    (filters.dateRange !== "all" && filters.dateRange !== "");

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sponsors Filter Dropdown */}
        <div>
          <Select value={filters.sponsor} onValueChange={(value) => handleFilterChange("sponsor", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Sponsors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sponsors</SelectItem>
              {sponsors.map((sponsor) => (
                <SelectItem key={sponsor} value={sponsor}>
                  {sponsor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Committee Filter Dropdown */}
        <div>
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

        {/* Date Range Filter Dropdown */}
        <div>
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

      {/* Clear Button */}
      {hasActiveFilters && (
        <Button
          variant="default"
          onClick={clearFilters}
          className="bg-black text-white hover:bg-black/90"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};