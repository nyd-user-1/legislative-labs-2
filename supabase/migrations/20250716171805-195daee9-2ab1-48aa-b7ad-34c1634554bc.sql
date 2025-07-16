
-- Fix subscribers table RLS policies to use optimized auth function calls
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Recreate with optimized auth function call
CREATE POLICY "select_own_subscription" 
ON public.subscribers 
FOR SELECT 
USING (((SELECT auth.uid()) = user_id) OR (email = (SELECT auth.email())));

-- Fix legislative_drafts table - remove duplicate SELECT policies and optimize remaining ones
DROP POLICY IF EXISTS "Enable read access for all users" ON public.legislative_drafts;
DROP POLICY IF EXISTS "Users can view their own drafts and co-authored drafts" ON public.legislative_drafts;

-- Create single optimized SELECT policy for legislative_drafts
CREATE POLICY "Users can view their own drafts and co-authored drafts" 
ON public.legislative_drafts 
FOR SELECT 
USING (
  ((SELECT auth.uid()) = user_id) OR 
  (is_public = true) OR 
  (EXISTS (
    SELECT 1 FROM co_authors ca 
    WHERE ca.legislative_draft_id = legislative_drafts.id 
    AND ca.user_id = (SELECT auth.uid()) 
    AND ca.status = 'accepted'
  ))
);

-- Add missing INSERT and DELETE policies for legislative_drafts that were cleaned up in previous migration
CREATE POLICY "Users can create their own drafts" 
ON public.legislative_drafts 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own drafts" 
ON public.legislative_drafts 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Fix legislative_ideas table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.legislative_ideas;
DROP POLICY IF EXISTS "Users can view their own legislative ideas" ON public.legislative_ideas;

-- Keep only the user-specific SELECT policy (already optimized in previous migration)
CREATE POLICY "Users can view their own legislative ideas" 
ON public.legislative_ideas 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

-- Fix problem_statements table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.problem_statements;
DROP POLICY IF EXISTS "Users can view their own problem statements" ON public.problem_statements;

-- Keep only the user-specific SELECT policy (already optimized in previous migration)  
CREATE POLICY "Users can view their own problem statements" 
ON public.problem_statements 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);
