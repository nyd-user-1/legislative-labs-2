-- Add missing foreign key relationship for blog_comments to profiles
ALTER TABLE public.blog_comments 
ADD CONSTRAINT blog_comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;