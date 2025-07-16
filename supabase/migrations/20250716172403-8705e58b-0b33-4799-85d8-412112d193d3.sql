
-- Remove unused indexes that are not providing value
-- Keep indexes that are important for RLS performance and foreign key lookups

-- Remove unused indexes on tables that may not be heavily queried yet
DROP INDEX IF EXISTS idx_media_outputs_legislative_draft_id;
DROP INDEX IF EXISTS idx_media_outputs_user_id;
DROP INDEX IF EXISTS idx_problem_chats_chat_session_id;
DROP INDEX IF EXISTS idx_legislative_ideas_problem_statement_id;
DROP INDEX IF EXISTS idx_legislative_drafts_legislative_idea_id;

-- Remove some user_id indexes on tables with light usage
DROP INDEX IF EXISTS idx_problem_statements_user_id;
DROP INDEX IF EXISTS idx_problem_chats_user_id;
DROP INDEX IF EXISTS idx_co_authors_user_id;
DROP INDEX IF EXISTS idx_co_authors_legislative_draft_id;

-- Remove composite indexes that may not be used
DROP INDEX IF EXISTS idx_co_authors_status_role;

-- Keep the most important indexes for core functionality:
-- - idx_chat_sessions_user_id (for user's chat sessions)
-- - idx_legislative_drafts_user_id (for user's drafts)
-- - idx_legislative_ideas_user_id (for user's ideas)
-- - idx_user_favorites_user_id (for user's bill favorites)
-- - idx_user_committee_favorites_user_id (for user's committee favorites)
-- - idx_user_member_favorites_user_id (for user's member favorites)
-- - idx_legislative_drafts_is_public (for public draft queries)
-- - idx_chat_sessions_committee_id and idx_chat_sessions_member_id (for entity-specific chats)
-- - idx_user_committee_favorites_committee_id and idx_user_member_favorites_member_id (for favorites lookups)
