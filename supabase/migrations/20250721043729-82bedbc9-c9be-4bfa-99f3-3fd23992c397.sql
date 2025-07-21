-- Drop the existing security definer view
DROP VIEW IF EXISTS public.problem_vote_stats;

-- Create a new SECURITY INVOKER view (default behavior)
CREATE VIEW public.problem_vote_stats 
WITH (security_invoker = true) AS
SELECT 
  problem_id,
  AVG(rating)::NUMERIC(3,2) as average_rating,
  COUNT(*) as total_votes
FROM problem_votes
GROUP BY problem_id;

-- Grant appropriate permissions
GRANT SELECT ON public.problem_vote_stats TO authenticated;
GRANT SELECT ON public.problem_vote_stats TO anon;