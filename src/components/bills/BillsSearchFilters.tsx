import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface BillsSearchFiltersProps {
  filters: {
    search: string;
    sponsor: string;
    committee: string;
    dateRange: string;
  };
  onFiltersChange: (filters: {
    search: string;
    sponsor: string;
    committee: string;
    dateRange: string;
  }) => void;
  committees: Array<{ name: string; chamber: string }>;
  sponsors: Array<{ name: string; chamber: string; party: string }>;
}

export const BillsSearchFilters = ({
  filters,
  onFiltersChange,
  committees,
  sponsors,
}: BillsSearchFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      sponsor: "",
      committee: "",
      dateRange: ""
    };
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = filters.search !== "" || 
    filters.sponsor !== "" ||
    filters.committee !== "" ||
    filters.dateRange !== "";

  const months = [
    { value: "all", label: "Month" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Select value={filters.sponsor || "all"} onValueChange={(value) => handleFilterChange("sponsor", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sponsors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sponsors</SelectItem>
              {sponsors.map((sponsor) => (
                <SelectItem key={sponsor.name} value={sponsor.name}>
                  <div className="flex items-center gap-2">
                    <span>{sponsor.name}</span>
                    {sponsor.chamber && (
                      <Badge variant="outline" className="text-xs">
                        {sponsor.chamber}
                      </Badge>
                    )}
                    {sponsor.party && (
                      <Badge variant="secondary" className="text-xs">
                        {sponsor.party}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.committee || "all"} onValueChange={(value) => handleFilterChange("committee", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Committees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Committees</SelectItem>
              {committees.map((committee) => (
                <SelectItem key={committee.name} value={committee.name}>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-48">{committee.name}</span>
                    {committee.chamber && (
                      <Badge variant="outline" className="text-xs">
                        {committee.chamber}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.dateRange || "all"} onValueChange={(value) => handleFilterChange("dateRange", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search bills (min 2 chars)..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};