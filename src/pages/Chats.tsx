import { ChatsLoadingSkeleton } from "./chats/components/ChatsLoadingSkeleton";
import { ChatsEmptyState } from "./chats/components/ChatsEmptyState";
import { ChatSessionCard } from "./chats/components/ChatSessionCard";
import { useChatSessions } from "./chats/hooks/useChatSessions";
import { useChatActions } from "./chats/hooks/useChatActions";

const Chats = () => {
  const { chatSessions, loading, deleteSession } = useChatSessions();
  const { copyToClipboard, handleFeedback } = useChatActions();

  if (loading) {
    return <ChatsLoadingSkeleton />;
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
          <ChatsEmptyState />
        ) : (
          <div className="space-y-4">
            {chatSessions.map((session) => (
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