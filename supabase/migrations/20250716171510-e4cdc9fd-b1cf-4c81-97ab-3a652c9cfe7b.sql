
-- Optimize RLS policies for user_favorites table
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Optimize RLS policies for user_member_favorites table
DROP POLICY IF EXISTS "Users can view their own member favorites" ON public.user_member_favorites;
DROP POLICY IF EXISTS "Users can create their own member favorites" ON public.user_member_favorites;
DROP POLICY IF EXISTS "Users can delete their own member favorites" ON public.user_member_favorites;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own member favorites" 
ON public.user_member_favorites 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own member favorites" 
ON public.user_member_favorites 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own member favorites" 
ON public.user_member_favorites 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Optimize RLS policies for user_committee_favorites table
DROP POLICY IF EXISTS "Users can view their own committee favorites" ON public.user_committee_favorites;
DROP POLICY IF EXISTS "Users can create their own committee favorites" ON public.user_committee_favorites;
DROP POLICY IF EXISTS "Users can delete their own committee favorites" ON public.user_committee_favorites;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own committee favorites" 
ON public.user_committee_favorites 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own committee favorites" 
ON public.user_committee_favorites 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own committee favorites" 
ON public.user_committee_favorites 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Optimize RLS policies for problem_chats table
DROP POLICY IF EXISTS "Users can view their own problem chats" ON public.problem_chats;
DROP POLICY IF EXISTS "Users can create their own problem chats" ON public.problem_chats;
DROP POLICY IF EXISTS "Users can update their own problem chats" ON public.problem_chats;
DROP POLICY IF EXISTS "Users can delete their own problem chats" ON public.problem_chats;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own problem chats" 
ON public.problem_chats 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own problem chats" 
ON public.problem_chats 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own problem chats" 
ON public.problem_chats 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own problem chats" 
ON public.problem_chats 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Clean up any duplicate policies on legislative_drafts (there seem to be multiple overlapping policies)
DROP POLICY IF EXISTS "Co-authors can update drafts" ON public.legislative_drafts;
DROP POLICY IF EXISTS "Co-authors can view drafts" ON public.legislative_drafts;
DROP POLICY IF EXISTS "Public drafts are viewable" ON public.legislative_drafts;
DROP POLICY IF EXISTS "Users can create their own drafts" ON public.legislative_drafts;
DROP POLICY IF EXISTS "Users can delete their own drafts" ON public.legislative_drafts;
DROP POLICY IF EXISTS "Users can update own drafts" ON public.legislative_drafts;
DROP POLICY IF EXISTS "Users can view own drafts" ON public.legislative_drafts;

-- The optimized policies for legislative_drafts are already in place from previous migration
-- Just ensure they remain as the only policies
