import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Users, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { MemberFilters } from "@/components/MemberFilters";
import { MemberCard } from "@/components/MemberCard";
import { MemberDetail } from "@/components/MemberDetail";

interface Member {
  people_id: number;
  name: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  party: string;
  chamber: string;
  district: string;
  role: string;
  email: string;
  phone_capitol: string;
  phone_district: string;
  address: string;
  bio_short: string;
  ballotpedia: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [chambers, setChambers] = useState<string[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    searchTerm: "",
    chamber: "",
    party: "",
    district: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getPartyColor = (party: string) => {
    if (!party) return "bg-muted";
    const partyLower = party.toLowerCase();
    if (partyLower.includes("republican") || partyLower.includes("r")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (partyLower.includes("democratic") || partyLower.includes("d")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-muted text-muted-foreground";
  };

  useEffect(() => {
    fetchMembers();
    fetchChambers();
    fetchParties();
    fetchDistricts();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, filters]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log("Fetching members with filters:", filters);

      let query = supabase
        .from("People")
        .select(`
          people_id,
          name,
          first_name,
          last_name,
          photo_url,
          party,
          chamber,
          district,
          role,
          email,
          phone_capitol,
          phone_district,
          address,
          bio_short,
          ballotpedia
        `)
        .not("chamber", "is", null)
        .not("name", "is", null);

      // Apply search filter
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,party.ilike.%${filters.searchTerm}%,district.ilike.%${filters.searchTerm}%,role.ilike.%${filters.searchTerm}%`);
      }

      // Apply chamber filter
      if (filters.chamber) {
        query = query.eq("chamber", filters.chamber);
      }

      // Apply party filter
      if (filters.party) {
        query = query.eq("party", filters.party);
      }

      // Apply district filter
      if (filters.district) {
        query = query.eq("district", filters.district);
      }

      // Order by name
      query = query.order("last_name", { ascending: true });

      // Limit results for performance
      query = query.limit(100);

      const { data, error } = await query;

      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      console.log("Members fetched successfully:", data?.length || 0, "members");
      setMembers(data || []);
      setHasMore((data?.length || 0) >= 100);
    } catch (err) {
      console.error("Error fetching members:", err);
      toast({
        title: "Error",
        description: "Failed to load members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChambers = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("chamber")
        .not("chamber", "is", null)
        .order("chamber");

      if (data) {
        const uniqueChambers = Array.from(
          new Set(data.map(item => item.chamber).filter(Boolean))
        ) as string[];
        setChambers(uniqueChambers);
      }
    } catch (error) {
      console.error("Error fetching chambers:", error);
    }
  };

  const fetchParties = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("party")
        .not("party", "is", null)
        .order("party");

      if (data) {
        const uniqueParties = Array.from(
          new Set(data.map(item => item.party).filter(Boolean))
        ) as string[];
        setParties(uniqueParties);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("district")
        .not("district", "is", null)
        .order("district");

      if (data) {
        const uniqueDistricts = Array.from(
          new Set(data.map(item => item.district).filter(Boolean))
        ) as string[];
        setDistricts(uniqueDistricts.sort((a, b) => parseInt(a) - parseInt(b)));
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(term) ||
        member.first_name?.toLowerCase().includes(term) ||
        member.last_name?.toLowerCase().includes(term) ||
        member.party?.toLowerCase().includes(term) ||
        member.district?.toLowerCase().includes(term) ||
        member.role?.toLowerCase().includes(term)
      );
    }

    if (filters.chamber) {
      filtered = filtered.filter(member => member.chamber === filters.chamber);
    }

    if (filters.party) {
      filtered = filtered.filter(member => member.party === filters.party);
    }

    if (filters.district) {
      filtered = filtered.filter(member => member.district === filters.district);
    }

    setFilteredMembers(filtered);
  };

  const openMemberDetail = (member: Member) => {
    setSelectedMember(member);
  };

  const loadMoreMembers = async () => {
    setLoadingMore(true);
    // Implementation for pagination would go here
    setLoadingMore(false);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="mb-8">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          
          <div className="mb-6 space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-64" />
          </div>

          <div className="grid-container">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="card">
                <CardHeader className="card-header">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="card-body">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Members</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchMembers} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Members Directory
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect with elected officials and their contact information
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filteredMembers.length} members found</span>
            <span>•</span>
            <span>{chambers.length} chambers</span>
          </div>
        </div>

        {/* Search and Filters */}
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

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Members Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || chamberFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "No members available"}
            </p>
          </div>
        ) : (
          <div className="grid-container">
            {filteredMembers.map((member) => (
              <Card key={member.people_id} className="card-interactive">
                <CardHeader className="card-header">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${member.photo_url ? 'hidden' : ''} text-lg font-semibold text-muted-foreground`}>
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight mb-1">
                        {member.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {member.party && (
                          <Badge variant="outline" className={getPartyColor(member.party)}>
                            {member.party}
                          </Badge>
                        )}
                        {member.chamber && (
                          <Badge variant="secondary">
                            {member.chamber}
                          </Badge>
                        )}
                      </div>
                      {member.role && (
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="card-body">
                  <div className="space-y-3">
                    {member.district && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>District {member.district}</span>
                      </div>
                    )}
                    
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={`mailto:${member.email}`}
                          className="text-primary hover:underline truncate"
                        >
                          {member.email}
                        </a>
                      </div>
                    )}
                    
                    {(member.phone_capitol || member.phone_district) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>
                          {member.phone_capitol || member.phone_district}
                        </span>
                      </div>
                    )}
                    
                    {member.ballotpedia && (
                      <div className="pt-2">
                        <a
                          href={member.ballotpedia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Full Bio
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Members;
