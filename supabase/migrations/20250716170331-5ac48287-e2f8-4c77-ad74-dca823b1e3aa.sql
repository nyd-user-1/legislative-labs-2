
-- Drop existing policies that use direct auth.uid() calls
DROP POLICY IF EXISTS "Users can view their own problem statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Users can create their own problem statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Users can update their own problem statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Users can delete their own problem statements" ON public.problem_statements;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own problem statements" 
ON public.problem_statements 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own problem statements" 
ON public.problem_statements 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own problem statements" 
ON public.problem_statements 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own problem statements" 
ON public.problem_statements 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);
