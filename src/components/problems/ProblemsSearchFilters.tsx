
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProblemsSearchFiltersProps {
  filters: {
    search: string;
    state: string;
  };
  onFiltersChange: (filters: { search: string; state: string }) => void;
}

const stateOptions = [
  { value: "all", label: "All States" },
  { value: "Problem Identified", label: "Problem Identified" },
  { value: "Policy Development", label: "Policy Development" },
  { value: "Policy Submission", label: "Policy Submission" },
  { value: "Public Gallery", label: "Public Gallery" }
];

export const ProblemsSearchFilters = ({
  filters,
  onFiltersChange,
}: ProblemsSearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for the filtering logic
    const filterValue = key === "state" && value === "all" ? "" : value;
    const newFilters = { ...localFilters, [key]: filterValue };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: "", state: "" };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = localFilters.search || localFilters.state;

  // Convert empty state back to "all" for display
  const displayState = localFilters.state === "" ? "all" : localFilters.state;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search problems..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* State Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={displayState}
              onValueChange={(value) => handleFilterChange("state", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
