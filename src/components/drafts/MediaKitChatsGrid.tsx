
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIChatSheet } from "@/components/AIChatSheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";

interface MediaKitChat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: any[];
}

export const MediaKitChatsGrid = () => {
  const [mediaKitChats, setMediaKitChats] = useState<MediaKitChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaKit, setSelectedMediaKit] = useState<any>(null);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaKitChats();
  }, []);

  const fetchMediaKitChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .like('title', 'Media Kit:%')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media kit chats:', error);
        toast({
          title: "Error",
          description: "Failed to load media kit chats. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const formattedChats = data?.map(chat => ({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        messages: JSON.parse(String(chat.messages) || '[]')
      })) || [];

      setMediaKitChats(formattedChats);
    } catch (error) {
      console.error('Error in fetchMediaKitChats:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMediaKit = (mediaKit: MediaKitChat) => {
    const mediaKitObject = {
      id: mediaKit.id,
      title: mediaKit.title,
      description: `Media kit from ${new Date(mediaKit.created_at).toLocaleDateString()}`,
      originalStatement: mediaKit.messages[0]?.content || "",
      mediaKitNumber: mediaKit.title.replace('Media Kit: ', '')
    };
    
    setSelectedMediaKit(mediaKitObject);
    setChatSheetOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading media kits...</span>
      </div>
    );
  }

  if (mediaKitChats.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">
            No media kits created yet. Generate your first media kit above to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaKitChats.map((mediaKit) => (
          <Card key={mediaKit.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {mediaKit.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Created {new Date(mediaKit.created_at).toLocaleDateString()}
                {mediaKit.updated_at !== mediaKit.created_at && (
                  <span className="block">
                    Updated {new Date(mediaKit.updated_at).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {mediaKit.messages.length} messages
                </p>
                <Button 
                  onClick={() => handleOpenMediaKit(mediaKit)}
                  className="w-full"
                  variant="outline"
                >
                  Open Media Kit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Chat Sheet for viewing existing media kits */}
      <AIChatSheet
        open={chatSheetOpen}
        onOpenChange={setChatSheetOpen}
        mediaKit={selectedMediaKit}
      />
    </>
  );
};
