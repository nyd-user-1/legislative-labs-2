import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface MemberFiltersProps {
  onFiltersChange: (filters: {
    searchTerm: string;
    chamber: string;
    party: string;
    district: string;
  }) => void;
  chambers: string[];
  parties: string[];
  districts: string[];
}

export const MemberFilters = ({ 
  onFiltersChange, 
  chambers, 
  parties, 
  districts 
}: MemberFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chamber, setChamber] = useState("");
  const [party, setParty] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    onFiltersChange({ searchTerm, chamber, party, district });
  }, [searchTerm, chamber, party, district, onFiltersChange]);

  const onClearFilters = () => {
    setSearchTerm("");
    setChamber("");
    setParty("");
    setDistrict("");
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex gap-4">
        <div className="relative max-w-7xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={chamber} onValueChange={setChamber}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Chambers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Chambers</SelectItem>
            {chambers.map((chamberOption) => (
              <SelectItem key={chamberOption} value={chamberOption}>
                {chamberOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={party} onValueChange={setParty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Parties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Parties</SelectItem>
            {parties.map((partyOption) => (
              <SelectItem key={partyOption} value={partyOption}>
                {partyOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Districts</SelectItem>
            {districts.map((districtOption) => (
              <SelectItem key={districtOption} value={districtOption}>
                District {districtOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={onClearFilters}
          variant="outline"
          size="lg"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};