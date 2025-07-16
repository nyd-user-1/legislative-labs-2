
-- Optimize RLS policies for legislative_ideas table
DROP POLICY IF EXISTS "Users can view their own legislative ideas" ON public.legislative_ideas;
DROP POLICY IF EXISTS "Users can create their own legislative ideas" ON public.legislative_ideas;
DROP POLICY IF EXISTS "Users can update their own legislative ideas" ON public.legislative_ideas;
DROP POLICY IF EXISTS "Users can delete their own legislative ideas" ON public.legislative_ideas;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own legislative ideas" 
ON public.legislative_ideas 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own legislative ideas" 
ON public.legislative_ideas 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own legislative ideas" 
ON public.legislative_ideas 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own legislative ideas" 
ON public.legislative_ideas 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Optimize RLS policies for media_outputs table
DROP POLICY IF EXISTS "Users can view their own media outputs" ON public.media_outputs;
DROP POLICY IF EXISTS "Users can create their own media outputs" ON public.media_outputs;
DROP POLICY IF EXISTS "Users can update their own media outputs" ON public.media_outputs;
DROP POLICY IF EXISTS "Users can delete their own media outputs" ON public.media_outputs;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own media outputs" 
ON public.media_outputs 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own media outputs" 
ON public.media_outputs 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own media outputs" 
ON public.media_outputs 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own media outputs" 
ON public.media_outputs 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Optimize RLS policies for co_authors table
DROP POLICY IF EXISTS "Users can view co-authorships for their drafts" ON public.co_authors;
DROP POLICY IF EXISTS "Draft owners can invite co-authors" ON public.co_authors;
DROP POLICY IF EXISTS "Users can update their own co-authorship status" ON public.co_authors;
DROP POLICY IF EXISTS "Draft owners can remove co-authors" ON public.co_authors;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view co-authorships for their drafts" 
ON public.co_authors 
FOR SELECT 
USING (((SELECT auth.uid()) = user_id) OR ((SELECT auth.uid()) = invited_by) OR (EXISTS ( SELECT 1
   FROM legislative_drafts ld
  WHERE ((ld.id = co_authors.legislative_draft_id) AND (ld.user_id = (SELECT auth.uid()))))));

CREATE POLICY "Draft owners can invite co-authors" 
ON public.co_authors 
FOR INSERT 
WITH CHECK (((SELECT auth.uid()) = invited_by) AND (EXISTS ( SELECT 1
   FROM legislative_drafts ld
  WHERE ((ld.id = co_authors.legislative_draft_id) AND (ld.user_id = (SELECT auth.uid()))))));

CREATE POLICY "Users can update their own co-authorship status" 
ON public.co_authors 
FOR UPDATE 
USING (((SELECT auth.uid()) = user_id) OR ((SELECT auth.uid()) = invited_by));

CREATE POLICY "Draft owners can remove co-authors" 
ON public.co_authors 
FOR DELETE 
USING (((SELECT auth.uid()) = invited_by) OR (EXISTS ( SELECT 1
   FROM legislative_drafts ld
  WHERE ((ld.id = co_authors.legislative_draft_id) AND (ld.user_id = (SELECT auth.uid()))))));

-- Optimize RLS policies for chat_sessions table
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own chat sessions" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
ON public.chat_sessions 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);
