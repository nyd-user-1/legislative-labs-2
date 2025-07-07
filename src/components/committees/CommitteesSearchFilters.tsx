import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CommitteesSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const CommitteesSearchFilters = ({
  searchTerm,
  setSearchTerm,
}: CommitteesSearchFiltersProps) => {
  return (
    <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search committees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
      </div>
    </section>
  );
};