
-- Create blog_proposals table
CREATE TABLE public.blog_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false
);

-- Create blog_votes table
CREATE TABLE public.blog_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES blog_proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, voter_id)
);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES blog_proposals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE
);

-- Create blog_proposal_stats view
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
  COALESCE(upvotes.count, 0) as upvotes,
  COALESCE(downvotes.count, 0) as downvotes,
  COALESCE(total_votes.count, 0) as total_votes,
  COALESCE(comments.count, 0) as comment_count
FROM blog_proposals bp
LEFT JOIN profiles p ON bp.author_id = p.user_id
LEFT JOIN (
  SELECT proposal_id, COUNT(*) as count
  FROM blog_votes
  WHERE vote_type = 'upvote'
  GROUP BY proposal_id
) upvotes ON bp.id = upvotes.proposal_id
LEFT JOIN (
  SELECT proposal_id, COUNT(*) as count
  FROM blog_votes
  WHERE vote_type = 'downvote'
  GROUP BY proposal_id
) downvotes ON bp.id = downvotes.proposal_id
LEFT JOIN (
  SELECT proposal_id, COUNT(*) as count
  FROM blog_votes
  GROUP BY proposal_id
) total_votes ON bp.id = total_votes.proposal_id
LEFT JOIN (
  SELECT proposal_id, COUNT(*) as count
  FROM blog_comments
  GROUP BY proposal_id
) comments ON bp.id = comments.proposal_id;

-- Enable RLS on all tables
ALTER TABLE public.blog_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_proposals
CREATE POLICY "Anyone can view published proposals" ON public.blog_proposals
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Users can create their own proposals" ON public.blog_proposals
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own proposals" ON public.blog_proposals
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own proposals" ON public.blog_proposals
  FOR DELETE USING (auth.uid() = author_id);

-- RLS policies for blog_votes
CREATE POLICY "Anyone can view votes" ON public.blog_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON public.blog_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can update their own votes" ON public.blog_votes
  FOR UPDATE USING (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own votes" ON public.blog_votes
  FOR DELETE USING (auth.uid() = voter_id);

-- RLS policies for blog_comments
CREATE POLICY "Anyone can view comments on published proposals" ON public.blog_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_proposals bp 
      WHERE bp.id = blog_comments.proposal_id 
      AND (bp.status = 'published' OR bp.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on published proposals" ON public.blog_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM blog_proposals bp 
      WHERE bp.id = blog_comments.proposal_id 
      AND bp.status = 'published'
    )
  );

CREATE POLICY "Users can update their own comments" ON public.blog_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.blog_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_proposals_updated_at BEFORE UPDATE ON blog_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_votes_updated_at BEFORE UPDATE ON blog_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
