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
  committees: string[];
  sponsors: string[];
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

  return (
    <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bills..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="input-field w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <Select value={filters.sponsor || "all"} onValueChange={(value) => handleFilterChange("sponsor", value === "all" ? "" : value)}>
              <SelectTrigger className="select-field w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent">
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

          <div>
            <Select value={filters.committee || "all"} onValueChange={(value) => handleFilterChange("committee", value === "all" ? "" : value)}>
              <SelectTrigger className="select-field w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent">
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

          <div>
            <Select value={filters.dateRange || "all"} onValueChange={(value) => handleFilterChange("dateRange", value === "all" ? "" : value)}>
              <SelectTrigger className="select-field w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent">
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

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="btn-secondary border border-gray-300 hover:border-gray-400 active:border-gray-500 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </section>
  );
};