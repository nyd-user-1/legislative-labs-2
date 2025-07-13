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
    filters.committee !== "";

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bills..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange("search", "")}
            className="absolute right-2 top-2 h-5 w-5 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select value={filters.sponsor || "all"} onValueChange={(value) => handleFilterChange("sponsor", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sponsors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sponsors</SelectItem>
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
              <SelectItem value="all">Committees</SelectItem>
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