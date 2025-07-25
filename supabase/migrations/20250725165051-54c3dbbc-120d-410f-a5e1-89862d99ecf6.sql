-- Fix Critical Database Security Issues

-- 1. Add missing search_path to database functions for security
CREATE OR REPLACE FUNCTION public.generate_problem_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  problem_number TEXT;
BEGIN
  -- Get the next sequential number with fully qualified column name
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(pc.problem_number FROM 2) AS INTEGER)) + 1 
     FROM public.problem_chats pc 
     WHERE pc.problem_number ~ '^P[0-9]+$'), 
    1
  ) INTO next_number;
  
  -- Format as P00001, P00002, etc.
  problem_number := 'P' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN problem_number;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_visitor_count()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today_date DATE := CURRENT_DATE;
  current_count INTEGER;
BEGIN
  -- Insert or update the count for today
  INSERT INTO public.visitor_counts (date, count)
  VALUES (today_date, 1)
  ON CONFLICT (date)
  DO UPDATE SET 
    count = public.visitor_counts.count + 1,
    updated_at = now();
  
  -- Return the current count
  SELECT count INTO current_count
  FROM public.visitor_counts
  WHERE date = today_date;
  
  RETURN current_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'username',
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.email
    )
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_co_author_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count + 1 
    WHERE id = NEW.legislative_draft_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count + 1 
    WHERE id = NEW.legislative_draft_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count - 1 
    WHERE id = NEW.legislative_draft_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count - 1 
    WHERE id = OLD.legislative_draft_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Add RLS policies for Top 50 Public Policy Problems table
ALTER TABLE public."Top 50 Public Policy Problems" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on policy problems" 
ON public."Top 50 Public Policy Problems" 
FOR SELECT 
USING (true);

-- 3. Recreate blog_proposal_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.blog_proposal_stats;

CREATE VIEW public.blog_proposal_stats AS
SELECT 
  bp.id,
  bp.title,
  bp.author_id,
  p.username,
  p.display_name,
  bp.status,
  bp.category,
  bp.created_at,
  bp.published_at,
  bp.view_count,
  bp.is_featured,
  COALESCE(vote_counts.upvotes, 0) as upvotes,
  COALESCE(vote_counts.downvotes, 0) as downvotes,
  COALESCE(vote_counts.total_votes, 0) as total_votes,
  COALESCE(comment_counts.comment_count, 0) as comment_count
FROM public.blog_proposals bp
LEFT JOIN public.profiles p ON bp.author_id = p.user_id
LEFT JOIN (
  SELECT 
    proposal_id,
    COUNT(CASE WHEN vote_type = 'upvote' THEN 1 END) as upvotes,
    COUNT(CASE WHEN vote_type = 'downvote' THEN 1 END) as downvotes,
    COUNT(*) as total_votes
  FROM public.blog_votes
  GROUP BY proposal_id
) vote_counts ON bp.id = vote_counts.proposal_id
LEFT JOIN (
  SELECT 
    proposal_id,
    COUNT(*) as comment_count
  FROM public.blog_comments
  GROUP BY proposal_id
) comment_counts ON bp.id = comment_counts.proposal_id;