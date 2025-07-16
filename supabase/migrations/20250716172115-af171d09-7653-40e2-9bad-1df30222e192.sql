
-- Add indexes for unindexed foreign keys to improve query performance

-- Index for chat_sessions.committee_id foreign key
CREATE INDEX IF NOT EXISTS idx_chat_sessions_committee_id 
ON public.chat_sessions (committee_id);

-- Index for chat_sessions.member_id foreign key  
CREATE INDEX IF NOT EXISTS idx_chat_sessions_member_id 
ON public.chat_sessions (member_id);

-- Index for legislative_drafts.legislative_idea_id foreign key
CREATE INDEX IF NOT EXISTS idx_legislative_drafts_legislative_idea_id 
ON public.legislative_drafts (legislative_idea_id);

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

-- Index for user_committee_favorites.committee_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_committee_favorites_committee_id 
ON public.user_committee_favorites (committee_id);

-- Index for user_member_favorites.member_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_member_favorites_member_id 
ON public.user_member_favorites (member_id);

-- Additional useful indexes for user_id columns to improve RLS performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id 
ON public.chat_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_legislative_drafts_user_id 
ON public.legislative_drafts (user_id);

CREATE INDEX IF NOT EXISTS idx_legislative_ideas_user_id 
ON public.legislative_ideas (user_id);

CREATE INDEX IF NOT EXISTS idx_problem_statements_user_id 
ON public.problem_statements (user_id);

CREATE INDEX IF NOT EXISTS idx_problem_chats_user_id 
ON public.problem_chats (user_id);

CREATE INDEX IF NOT EXISTS idx_co_authors_user_id 
ON public.co_authors (user_id);

CREATE INDEX IF NOT EXISTS idx_co_authors_legislative_draft_id 
ON public.co_authors (legislative_draft_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id 
ON public.user_favorites (user_id);

CREATE INDEX IF NOT EXISTS idx_user_committee_favorites_user_id 
ON public.user_committee_favorites (user_id);

CREATE INDEX IF NOT EXISTS idx_user_member_favorites_user_id 
ON public.user_member_favorites (user_id);

-- Composite indexes for frequently queried combinations
CREATE INDEX IF NOT EXISTS idx_co_authors_status_role 
ON public.co_authors (status, role);

CREATE INDEX IF NOT EXISTS idx_legislative_drafts_is_public 
ON public.legislative_drafts (is_public);
