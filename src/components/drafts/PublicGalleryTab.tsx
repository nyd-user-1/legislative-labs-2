import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Share2, Heart, Star, Eye, Search, Filter, TrendingUp, Clock, Users } from "lucide-react";
import { LegislativeDraft } from "@/types/draft";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PublicDraft extends LegislativeDraft {
  authorProfile?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const PublicGalleryTab = () => {
  const [drafts, setDrafts] = useState<PublicDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [filterType, setFilterType] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPublicDrafts();
  }, [searchTerm, sortBy, filterType]);

  const fetchPublicDrafts = async () => {
    try {
      let query = supabase
        .from('legislative_drafts')
        .select(`
          *,
          profiles (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('is_public', true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,draft_content.ilike.%${searchTerm}%`);
      }

      if (filterType) {
        query = query.eq('type', filterType);
      }

      switch (sortBy) {
        case 'popular':
          query = query.order('co_author_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'updated':
        default:
          query = query.order('updated_at', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      
      const publicDrafts = data?.map(draft => ({
        ...draft,
        authorProfile: draft.profiles
      })) || [];

      setDrafts(publicDrafts);
    } catch (error) {
      console.error('Error fetching public drafts:', error);
      toast({
        title: "Error",
        description: "Failed to load public drafts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-green-600" />
            Public Legislative Drafts Gallery
          </CardTitle>
          <p className="text-gray-600">
            Explore and discover legislative drafts shared by the community.
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search public drafts..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recently Updated
                    </div>
                  </SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Newest First
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Most Collaborative
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="bill">Bill</SelectItem>
                  <SelectItem value="resolution">Resolution</SelectItem>
                  <SelectItem value="amendment">Amendment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draft Gallery */}
      {drafts.length === 0 ? (
        <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="text-center py-12">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No public drafts found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No drafts match your search criteria.' : 'No public drafts available yet.'}
            </p>
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
                        <Eye className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                      {draft.co_author_count && draft.co_author_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {draft.co_author_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {draft.draft_content.substring(0, 150)}...
                </p>
                
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={draft.authorProfile?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {(draft.authorProfile?.display_name || draft.authorProfile?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">
                    by {draft.authorProfile?.display_name || draft.authorProfile?.username || 'Anonymous'}
                  </span>
                </div>
                
                {/* Rating */}
                {draft.votes && draft.votes.totalVotes > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(draft.votes.rating))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({draft.votes.totalVotes} vote{draft.votes.totalVotes !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
                
                <Separator className="my-3" />
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(draft.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      Like
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};