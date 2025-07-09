import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, FileText, Share, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaOutput {
  id: string;
  title: string;
  content_type: string;
  content: string;
  metadata: any;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  legislative_draft_id?: string;
}

const MediaKits = () => {
  const [mediaOutputs, setMediaOutputs] = useState<MediaOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaOutputs();
  }, []);

  const fetchMediaOutputs = async () => {
    try {
      const { data, error } = await supabase
        .from("media_outputs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMediaOutputs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch media outputs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOutputs = mediaOutputs.filter(output =>
    output.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    output.content_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "press_release": return "default";
      case "social_media": return "secondary";
      case "infographic": return "outline";
      case "video_script": return "destructive";
      default: return "default";
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "press_release": return FileText;
      case "social_media": return Share;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="page-container min-h-screen bg-gray-50 p-6">
        <div className="content-wrapper max-w-6xl mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-gray-50 p-6">
      <div className="content-wrapper max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Kits</h1>
              <p className="text-gray-600 mt-2">Generate and manage press releases, social media content, and promotional materials</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Content
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search media content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutputs.map((output) => {
              const Icon = getContentTypeIcon(output.content_type);
              return (
                <Card key={output.id} className="card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {output.title}
                        </CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getContentTypeColor(output.content_type)}>
                        {output.content_type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {output.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-4 mb-4">
                      {output.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Created {new Date(output.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredOutputs.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No media content found.</p>
              <Button className="mt-4">
                Generate your first media kit
              </Button>
            </div>
          )}

          {/* Content Type Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t">
            <Card className="text-center p-6">
              <FileText className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-medium mb-2">Press Releases</h3>
              <p className="text-sm text-gray-600">Professional announcements for media outlets</p>
            </Card>
            <Card className="text-center p-6">
              <Share className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-medium mb-2">Essay</h3>
              <p className="text-sm text-gray-600">Engaging essay for various platforms</p>
            </Card>
            <Card className="text-center p-6">
              <FileText className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-medium mb-2">Talking Points</h3>
              <p className="text-sm text-gray-600">Talking points with key information</p>
            </Card>
            <Card className="text-center p-6">
              <FileText className="h-8 w-8 mx-auto mb-3 text-red-500" />
              <h3 className="font-medium mb-2">Speech</h3>
              <p className="text-sm text-gray-600">Compelling speeches for video content</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaKits;