-- Fix remaining security issues

-- 1. Fix any remaining functions that need search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Add triggers for database functions where missing
CREATE TRIGGER trigger_update_updated_at_blog_proposals
  BEFORE UPDATE ON public.blog_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_updated_at_blog_comments  
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_updated_at_blog_votes
  BEFORE UPDATE ON public.blog_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create trigger for co_author_count management
CREATE TRIGGER trigger_update_co_author_count
  AFTER INSERT OR UPDATE OR DELETE ON public.co_authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_co_author_count();

-- 4. Create trigger for user profile creation
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();