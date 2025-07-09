import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, Copy, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ChatSession = Tables<"chat_sessions">;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const Chats = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setChatSessions(data || []);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      toast({
        title: "Chat deleted",
        description: "Chat session has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (type: "thumbs-up" | "thumbs-down") => {
    toast({
      title: "Feedback recorded",
      description: `Thank you for your ${type === "thumbs-up" ? "positive" : "negative"} feedback`,
    });
  };

  const parseMessages = (messagesJson: any): Message[] => {
    try {
      return Array.isArray(messagesJson) ? messagesJson : JSON.parse(messagesJson || "[]");
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
            <p className="text-muted-foreground">Your saved AI chat sessions</p>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
          <p className="text-muted-foreground">
            {chatSessions.length === 0 ? "No saved chats yet" : `${chatSessions.length} saved chat sessions`}
          </p>
        </div>

        {chatSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No chat sessions yet</h3>
              <p className="text-muted-foreground text-center">
                Start a conversation with AI on the Bills page to create your first chat session
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chatSessions.map((session) => {
              const messages = parseMessages(session.messages);
              const messageCount = messages.length;
              
              return (
                <Card key={session.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{format(new Date(session.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
                          <span>{messageCount} messages</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSession(session.id)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="chat-content" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2">
                          View conversation
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                            <div className="space-y-4">
                              {messages.map((message, index) => (
                                <div key={index} className="space-y-2">
                                  <div
                                    className={`flex ${
                                      message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                                  >
                                    <div
                                      className={`max-w-[80%] rounded-lg p-3 ${
                                        message.role === "user"
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted"
                                      }`}
                                    >
                                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                      {message.timestamp && (
                                        <p className="text-xs opacity-70 mt-1">
                                          {format(new Date(message.timestamp), "h:mm a")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {message.role === "assistant" && (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(message.content)}
                                        className="h-8 px-2"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFeedback("thumbs-up")}
                                        className="h-8 px-2"
                                      >
                                        <ThumbsUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFeedback("thumbs-down")}
                                        className="h-8 px-2"
                                      >
                                        <ThumbsDown className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;