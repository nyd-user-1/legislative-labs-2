import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface CommitteesSearchFiltersProps {
  filters: {
    search: string;
    chamber: string;
    committeeType: string;
  };
  onFiltersChange: (filters: {
    search: string;
    chamber: string;
    committeeType: string;
  }) => void;
  chambers: string[];
  committeeTypes: string[];
}

export const CommitteesSearchFilters = ({
  filters,
  onFiltersChange,
  chambers,
  committeeTypes,
}: CommitteesSearchFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      chamber: "",
      committeeType: ""
    };
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = filters.search !== "" || 
    filters.chamber !== "" ||
    filters.committeeType !== "";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search committees..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <Select value={filters.chamber || "all"} onValueChange={(value) => handleFilterChange("chamber", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Chambers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chambers</SelectItem>
              {chambers.map((chamber) => (
                <SelectItem key={chamber} value={chamber}>
                  {chamber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={filters.committeeType || "all"} onValueChange={(value) => handleFilterChange("committeeType", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {committeeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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