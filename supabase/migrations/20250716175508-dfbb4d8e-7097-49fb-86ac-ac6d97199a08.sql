
-- Add indexes for unindexed foreign keys to improve query performance

-- Index for legislative_ideas.problem_statement_id foreign key
CREATE INDEX IF NOT EXISTS idx_legislative_ideas_problem_statement_id 
ON public.legislative_ideas (problem_statement_id);

-- Index for media_outputs.legislative_draft_id foreign key
CREATE INDEX IF NOT EXISTS idx_media_outputs_legislative_draft_id 
ON public.media_outputs (legislative_draft_id);

-- Index for media_outputs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_media_outputs_user_id 
ON public.media_outputs (user_id);

-- Index for problem_chats.chat_session_id foreign key
CREATE INDEX IF NOT EXISTS idx_problem_chats_chat_session_id 
ON public.problem_chats (chat_session_id);

-- Index for problem_statements.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_problem_statements_user_id 
ON public.problem_statements (user_id);

-- Index for subscribers.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id 
ON public.subscribers (user_id);
