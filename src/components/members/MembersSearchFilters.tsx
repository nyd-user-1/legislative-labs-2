import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search } from "lucide-react";

interface MembersSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  chamberFilter: string;
  setChamberFilter: (chamber: string) => void;
  chambers: string[];
}

export const MembersSearchFilters = ({
  searchTerm,
  setSearchTerm,
  chamberFilter,
  setChamberFilter,
  chambers,
}: MembersSearchFiltersProps) => {
  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Chamber Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Chamber:</span>
        <ToggleGroup
          type="single"
          value={chamberFilter}
          onValueChange={(value) => setChamberFilter(value || "all")}
        >
          <ToggleGroupItem value="all" variant="outline">
            All Chambers
          </ToggleGroupItem>
          {chambers.map((chamber) => (
            <ToggleGroupItem key={chamber} value={chamber} variant="outline">
              {chamber}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};