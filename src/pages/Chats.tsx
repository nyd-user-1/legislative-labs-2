
import { ChatsLoadingSkeleton } from "./chats/components/ChatsLoadingSkeleton";
import { ChatsEmptyState } from "./chats/components/ChatsEmptyState";
import { ChatSessionCard } from "./chats/components/ChatSessionCard";
import { useChatSessions } from "./chats/hooks/useChatSessions";
import { useChatActions } from "./chats/hooks/useChatActions";
import { Card, CardContent } from "@/components/ui/card";

const Chats = () => {
  const { chatSessions, loading, deleteSession } = useChatSessions();
  const { copyToClipboard, handleFeedback } = useChatActions();

  if (loading) {
    return <ChatsLoadingSkeleton />;
  }

  // Filter to only include bill, member, and committee chats
  const relevantChats = chatSessions.filter(session => 
    session.bill_id || 
    session.member_id ||
    session.committee_id ||
    session.title.toLowerCase().includes('analysis:') ||
    session.title.toLowerCase().includes('bill') ||
    session.title.toLowerCase().includes('member') ||
    session.title.toLowerCase().includes('committee')
  );

  const totalChats = relevantChats.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
          <p className="text-muted-foreground">
            {totalChats === 0 
              ? "No saved chats yet" 
              : `${totalChats} chat session${totalChats === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {totalChats === 0 ? (
          <ChatsEmptyState />
        ) : (
          <div className="space-y-4">
            {relevantChats.map((session) => (
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
