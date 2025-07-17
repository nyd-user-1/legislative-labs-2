
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { SearchResultItem } from "./SearchResultItem";

interface SidebarSearchProps {
  collapsed: boolean;
  onSearchResultClick: (result: SearchResult) => void;
}

export function SidebarSearch({ collapsed, onSearchResultClick }: SidebarSearchProps) {
  const { searchTerm, searchResults, clearSearch } = useSearch();

  if (collapsed) return null;

  return (
    <>
      {/* Search Results */}
      {searchResults.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Search Results</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {searchResults.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  onClick={onSearchResultClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}
