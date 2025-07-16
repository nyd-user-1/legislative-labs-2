
-- Add missing index for the foreign key on legislative_drafts table
CREATE INDEX IF NOT EXISTS idx_legislative_drafts_legislative_idea_id 
ON public.legislative_drafts (legislative_idea_id);
