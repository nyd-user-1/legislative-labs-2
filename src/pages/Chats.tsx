
import { ChatsLoadingSkeleton } from "./chats/components/ChatsLoadingSkeleton";
import { ChatsEmptyState } from "./chats/components/ChatsEmptyState";
import { ChatSessionCard } from "./chats/components/ChatSessionCard";
import { useChatSessions } from "./chats/hooks/useChatSessions";
import { useChatActions } from "./chats/hooks/useChatActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Chats = () => {
  const { chatSessions, loading, deleteSession } = useChatSessions();
  const { copyToClipboard, handleFeedback } = useChatActions();

  if (loading) {
    return <ChatsLoadingSkeleton />;
  }

  // Categorize chat sessions based on their titles and content
  const billChats = chatSessions.filter(session => 
    session.bill_id || 
    session.title.toLowerCase().includes('analysis:') ||
    session.title.toLowerCase().includes('bill')
  );

  const problemChats = chatSessions.filter(session => 
    session.title.toLowerCase().includes('problem:') ||
    session.title.toLowerCase().includes('problem ')
  );

  const solutionChats = chatSessions.filter(session => 
    session.title.toLowerCase().includes('solution:') ||
    session.title.toLowerCase().includes('solution ')
  );

  const mediaKitChats = chatSessions.filter(session => 
    session.title.toLowerCase().includes('media kit:') ||
    session.title.toLowerCase().includes('media kit ')
  );

  // Get remaining chats that don't fit into the above categories
  const otherChats = chatSessions.filter(session => 
    !billChats.includes(session) && 
    !problemChats.includes(session) && 
    !solutionChats.includes(session) &&
    !mediaKitChats.includes(session)
  );

  const totalChats = chatSessions.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
          <p className="text-muted-foreground">
            {totalChats === 0 
              ? "No saved chats yet" 
              : `${billChats.length} bill chats, ${problemChats.length} problem chats, ${solutionChats.length} solution chats, ${mediaKitChats.length} media kit chats`
            }
          </p>
        </div>

        {totalChats === 0 ? (
          <ChatsEmptyState />
        ) : (
          <Tabs defaultValue="bills" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bills">Bills ({billChats.length})</TabsTrigger>
              <TabsTrigger value="problems">Problems ({problemChats.length})</TabsTrigger>
              <TabsTrigger value="solutions">Solutions ({solutionChats.length})</TabsTrigger>
              <TabsTrigger value="media-kits">Media Kits ({mediaKitChats.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bills" className="space-y-4">
              {billChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No bill chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                billChats.map((session) => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={deleteSession}
                    onCopy={copyToClipboard}
                    onFeedback={handleFeedback}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="problems" className="space-y-4">
              {problemChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No problem chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                problemChats.map((session) => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={deleteSession}
                    onCopy={copyToClipboard}
                    onFeedback={handleFeedback}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4">
              {solutionChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No solution chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                solutionChats.map((session) => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={deleteSession}
                    onCopy={copyToClipboard}
                    onFeedback={handleFeedback}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="media-kits" className="space-y-4">
              {mediaKitChats.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No media kit chats yet</p>
                  </CardContent>
                </Card>
              ) : (
                mediaKitChats.map((session) => (
                  <ChatSessionCard
                    key={session.id}
                    session={session}
                    onDelete={deleteSession}
                    onCopy={copyToClipboard}
                    onFeedback={handleFeedback}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Show other/uncategorized chats if any exist */}
        {otherChats.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Other Chats</h2>
            {otherChats.map((session) => (
              <ChatSessionCard
                key={session.id}
                session={session}
                onDelete={deleteSession}
                onCopy={copyToClipboard}
                onFeedback={handleFeedback}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
