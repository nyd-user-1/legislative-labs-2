
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type CoAuthor = Tables<"co_authors">;
type Profile = Tables<"profiles">;

interface CoAuthorAttributionProps {
  draftId: string;
  ownerId: string;
  compact?: boolean;
}

export const CoAuthorAttribution = ({ draftId, ownerId, compact = false }: CoAuthorAttributionProps) => {
  const [coAuthors, setCoAuthors] = useState<(CoAuthor & { profile?: Profile })[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchAttributionData();
  }, [draftId, ownerId]);

  const fetchAttributionData = async () => {
    try {
      // Fetch co-authors
      const { data: coAuthorData, error: coAuthorError } = await supabase
        .from("co_authors")
        .select("*")
        .eq("legislative_draft_id", draftId)
        .eq("status", "accepted")
        .order("accepted_at", { ascending: true });

      if (coAuthorError) throw coAuthorError;

      // Fetch profiles for co-authors
      const coAuthorsWithProfiles = await Promise.all(
        (coAuthorData || []).map(async (coAuthor) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", coAuthor.user_id)
            .single();
          
          return { ...coAuthor, profile };
        })
      );

      // Fetch owner profile
      const { data: ownerData, error: ownerError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", ownerId)
        .single();

      if (ownerError) throw ownerError;

      setCoAuthors(coAuthorsWithProfiles);
      setOwnerProfile(ownerData);
    } catch (error) {
      console.error("Error fetching attribution data:", error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return Crown;
      case "collaborator": return Edit;
      case "viewer": return Eye;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "default";
      case "collaborator": return "secondary";
      case "viewer": return "outline";
      default: return "outline";
    }
  };

  const allContributors = [
    ...(ownerProfile ? [{ 
      id: "owner", 
      profile: ownerProfile, 
      role: "owner" as const,
      status: "accepted" as const
    }] : []),
    ...coAuthors.filter(ca => ca.profile).map(ca => ({
      ...ca,
      role: ca.role as "collaborator" | "viewer"
    }))
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {allContributors.slice(0, 3).map((contributor, index) => {
            const RoleIcon = getRoleIcon(contributor.role);
            return (
              <div key={contributor.id} className="relative group">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {contributor.profile?.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {/* Simple hover card replacement */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="flex items-center gap-2">
                    <span>{contributor.profile?.display_name || "Unknown"}</span>
                    <Badge variant={getRoleColor(contributor.role)} className="text-xs">
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {contributor.role}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {allContributors.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{allContributors.length - 3} more
          </span>
        )}
        {allContributors.length > 1 && (
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Collaborative
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <h4 className="font-medium text-sm">Contributors ({allContributors.length})</h4>
      </div>
      
      <div className="space-y-2">
        {allContributors.map((contributor) => {
          const RoleIcon = getRoleIcon(contributor.role);
          return (
            <div key={contributor.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {contributor.profile?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {contributor.profile?.display_name || "Unknown User"}
                </p>
                <Badge variant={getRoleColor(contributor.role)} className="text-xs">
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {contributor.role}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {allContributors.length === 1 && (
        <div className="text-xs text-muted-foreground">
          This draft has a single author
        </div>
      )}
    </div>
  );
};
