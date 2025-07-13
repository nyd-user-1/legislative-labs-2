import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  const [searchValue, setSearchValue] = useState(filters.search);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Update local search value when filters change from outside
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for 500ms delay
    searchTimeoutRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: value };
      onFiltersChange(newFilters);
    }, 500);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearchValue("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
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

  // Get unique sponsors to avoid duplicate keys
  const uniqueSponsors = sponsors.reduce((acc, sponsor) => {
    const key = `${sponsor.name}-${sponsor.chamber}-${sponsor.party}`;
    if (!acc.some(s => `${s.name}-${s.chamber}-${s.party}` === key)) {
      acc.push(sponsor);
    }
    return acc;
  }, [] as typeof sponsors);

  // Get unique committees to avoid duplicate keys  
  const uniqueCommittees = committees.reduce((acc, committee) => {
    const key = `${committee.name}-${committee.chamber}`;
    if (!acc.some(c => `${c.name}-${c.chamber}` === key)) {
      acc.push(committee);
    }
    return acc;
  }, [] as typeof committees);

  // Get the selected sponsor's display name
  const selectedSponsor = uniqueSponsors.find(s => s.name === filters.sponsor);

  // Get the selected committee's display name
  const selectedCommittee = uniqueCommittees.find(c => c.name === filters.committee);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bills..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchValue("");
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
              handleFilterChange("search", "");
            }}
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
              <SelectValue 
                placeholder="Sponsors"
              >
                {selectedSponsor ? selectedSponsor.name : "Sponsors"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sponsors</SelectItem>
              {uniqueSponsors.map((sponsor, index) => (
                <SelectItem key={`${sponsor.name}-${index}`} value={sponsor.name}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {sponsor.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{sponsor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {sponsor.chamber} • {sponsor.party}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.committee || "all"} onValueChange={(value) => handleFilterChange("committee", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue 
                placeholder="Committees"
              >
                {selectedCommittee ? selectedCommittee.name : "Committees"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Committees</SelectItem>
              {uniqueCommittees.map((committee, index) => (
                <SelectItem key={`${committee.name}-${index}`} value={committee.name}>
                  <span className="text-sm font-medium">{committee.name}</span>
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