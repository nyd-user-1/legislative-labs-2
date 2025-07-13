import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface MembersSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  chamberFilter: string;
  setChamberFilter: (chamber: string) => void;
  partyFilter: string;
  setPartyFilter: (party: string) => void;
  districtFilter: string;
  setDistrictFilter: (district: string) => void;
  chambers: string[];
  parties: string[];
  districts: string[];
}

export const MembersSearchFilters = ({
  searchTerm,
  setSearchTerm,
  chamberFilter,
  setChamberFilter,
  partyFilter,
  setPartyFilter,
  districtFilter,
  setDistrictFilter,
  chambers,
  parties,
  districts,
}: MembersSearchFiltersProps) => {
  const clearFilters = () => {
    setSearchTerm("");
    setChamberFilter("all");
    setPartyFilter("all");
    setDistrictFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || 
    (chamberFilter !== "all" && chamberFilter !== "") ||
    (partyFilter !== "all" && partyFilter !== "") ||
    (districtFilter !== "all" && districtFilter !== "");

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Dropdowns Row */}
      <div className="grid grid-cols-1 gap-4 items-end">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters - Hidden on mobile, visible on desktop */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {/* Party Filter Dropdown */}
          <div>
            <Select value={partyFilter} onValueChange={setPartyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Parties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parties</SelectItem>
                {parties.map((party) => (
                  <SelectItem key={party} value={party}>
                    {party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Filter Dropdown */}
          <div>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    District {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chamber Filter Dropdown */}
          <div>
            <Select value={chamberFilter} onValueChange={setChamberFilter}>
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