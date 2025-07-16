
-- Fix legislative_drafts UPDATE policy to use optimized auth function calls
DROP POLICY IF EXISTS "Users can update their own drafts and co-authored drafts" ON public.legislative_drafts;

CREATE POLICY "Users can update their own drafts and co-authored drafts" 
ON public.legislative_drafts 
FOR UPDATE 
USING (
  ((SELECT auth.uid()) = user_id) OR 
  (EXISTS (
    SELECT 1 FROM co_authors ca 
    WHERE ca.legislative_draft_id = legislative_drafts.id 
    AND ca.user_id = (SELECT auth.uid()) 
    AND ca.status = 'accepted' 
    AND ca.role = ANY (ARRAY['owner', 'collaborator'])
  ))
);

-- Fix profiles table - remove duplicate SELECT policies 
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Keep only one SELECT policy for profiles (they should be viewable by everyone)
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);
