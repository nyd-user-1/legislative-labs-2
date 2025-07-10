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
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchPublicDrafts();
  }, [searchTerm, sortBy, filterType]);
  const fetchPublicDrafts = async () => {
    try {
      let query = supabase.from('legislative_drafts').select(`
          *,
          profiles (
            display_name,
            username,
            avatar_url
          )
        `).eq('is_public', true);
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,draft_content.ilike.%${searchTerm}%`);
      }
      if (filterType) {
        query = query.eq('type', filterType);
      }
      switch (sortBy) {
        case 'popular':
          query = query.order('co_author_count', {
            ascending: false
          });
          break;
        case 'recent':
          query = query.order('created_at', {
            ascending: false
          });
          break;
        case 'updated':
        default:
          query = query.order('updated_at', {
            ascending: false
          });
          break;
      }
      const {
        data,
        error
      } = await query.limit(50);
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
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const renderStars = (rating: number) => {
    return Array.from({
      length: 5
    }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />);
  };
  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({
        length: 9
      }).map((_, i) => <Card key={i} className="animate-pulse">
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
          </Card>)}
      </div>;
  }
  return;
};