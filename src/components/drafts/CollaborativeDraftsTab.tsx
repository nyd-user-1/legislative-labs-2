import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Users, UserPlus, Clock, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { LegislativeDraft, CoAuthor } from "@/types/draft";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CollaborativeDraft extends LegislativeDraft {
  coAuthors?: CoAuthor[];
  ownerProfile?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const CollaborativeDraftsTab = () => {
  const [drafts, setDrafts] = useState<CollaborativeDraft[]>([]);
  const [invitations, setInvitations] = useState<CoAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCollaborativeDrafts();
    fetchInvitations();
  }, []);

  const fetchCollaborativeDrafts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get co-author relationships
      const { data: coAuthorData, error: coAuthorError } = await supabase
        .from('co_authors')
        .select('legislative_draft_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (coAuthorError) throw coAuthorError;

      if (!coAuthorData || coAuthorData.length === 0) {
        setDrafts([]);
        return;
      }

      const draftIds = coAuthorData.map(ca => ca.legislative_draft_id);

      // Get the actual drafts
      const { data: draftsData, error: draftsError } = await supabase
        .from('legislative_drafts')
        .select(`
          *,
          profiles (
            display_name,
            username,
            avatar_url
          )
        `)
        .in('id', draftIds);

      if (draftsError) throw draftsError;

      const collaborativeDrafts = draftsData?.map(draft => ({
        ...draft,
        ownerProfile: draft.profiles
      })) || [];

      setDrafts(collaborativeDrafts);
    } catch (error) {
      console.error('Error fetching collaborative drafts:', error);
      toast({
        title: "Error",
        description: "Failed to load collaborative drafts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('co_authors')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (invitationsError) throw invitationsError;

      if (!invitationsData || invitationsData.length === 0) {
        setInvitations([]);
        return;
      }

      // Get draft details
      const draftIds = invitationsData.map(inv => inv.legislative_draft_id);
      const { data: draftsData } = await supabase
        .from('legislative_drafts')
        .select('id, title, type')
        .in('id', draftIds);

      // Get inviter profiles
      const inviterIds = invitationsData.map(inv => inv.invited_by);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', inviterIds);

      // Combine the data
      const enrichedInvitations = invitationsData.map(inv => ({
        ...inv,
        legislative_drafts: draftsData?.find(d => d.id === inv.legislative_draft_id),
        profiles: profilesData?.find(p => p.user_id === inv.invited_by)
      }));

      setInvitations(enrichedInvitations);

    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      const updateData = {
        status: accept ? 'accepted' : 'declined',
        accepted_at: accept ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('co_authors')
        .update(updateData)
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: accept ? "Invitation accepted" : "Invitation declined",
        description: accept 
          ? "You can now collaborate on this draft."
          : "The invitation has been declined.",
      });

      // Refresh data
      fetchInvitations();
      if (accept) fetchCollaborativeDrafts();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        title: "Error",
        description: "Failed to respond to invitation.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {invitation.legislative_drafts?.title || 'Legislative Draft'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Invited by {invitation.profiles?.display_name || invitation.profiles?.username || 'Unknown'}
                      {' '}as {invitation.role}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(invitation.invited_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleInvitationResponse(invitation.id, true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleInvitationResponse(invitation.id, false)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaborative Drafts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborative Drafts</h3>
        
        {drafts.length === 0 ? (
          <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No collaborative drafts</h3>
              <p className="text-gray-600 mb-4">
                You haven't been invited to collaborate on any drafts yet.
              </p>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Others to Your Drafts
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <Card key={draft.id} className="card-interactive bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {draft.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getStatusColor(draft.status)}`}>
                          {draft.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Collaborative
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {draft.draft_content?.substring(0, 150)}...
                  </p>
                  
                  {/* Owner Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={draft.ownerProfile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {(draft.ownerProfile?.display_name || draft.ownerProfile?.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">
                      by {draft.ownerProfile?.display_name || draft.ownerProfile?.username || 'Unknown'}
                    </span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(draft.updated_at).toLocaleDateString()}
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};