
-- Create blog-related tables with proper foreign key relationships
-- This implementation follows best practices by referencing profiles.user_id

-- 1. Create blog_proposals table
CREATE TABLE public.blog_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE
);

-- 2. Create blog_votes table
CREATE TABLE public.blog_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.blog_proposals(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(proposal_id, voter_id) -- Prevent duplicate votes from same user
);

-- 3. Create blog_comments table
CREATE TABLE public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.blog_proposals(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE
);

-- 4. Enable Row Level Security on all tables
ALTER TABLE public.blog_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for blog_proposals
CREATE POLICY "Anyone can view published proposals" 
    ON public.blog_proposals FOR SELECT 
    USING (status = 'published');

CREATE POLICY "Authors can view their own proposals" 
    ON public.blog_proposals FOR SELECT 
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can create their own proposals" 
    ON public.blog_proposals FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own proposals" 
    ON public.blog_proposals FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own proposals" 
    ON public.blog_proposals FOR DELETE 
    USING (auth.uid() = author_id);

-- 6. Create RLS policies for blog_votes
CREATE POLICY "Anyone can view votes on published proposals" 
    ON public.blog_votes FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.blog_proposals 
        WHERE id = blog_votes.proposal_id AND status = 'published'
    ));

CREATE POLICY "Users can view their own votes" 
    ON public.blog_votes FOR SELECT 
    USING (auth.uid() = voter_id);

CREATE POLICY "Authenticated users can vote on published proposals" 
    ON public.blog_votes FOR INSERT 
    WITH CHECK (
        auth.uid() = voter_id AND 
        EXISTS (
            SELECT 1 FROM public.blog_proposals 
            WHERE id = blog_votes.proposal_id AND status = 'published'
        )
    );

CREATE POLICY "Users can update their own votes" 
    ON public.blog_votes FOR UPDATE 
    USING (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own votes" 
    ON public.blog_votes FOR DELETE 
    USING (auth.uid() = voter_id);

-- 7. Create RLS policies for blog_comments
CREATE POLICY "Anyone can view comments on published proposals" 
    ON public.blog_comments FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.blog_proposals 
        WHERE id = blog_comments.proposal_id AND status = 'published'
    ));

CREATE POLICY "Authors can view their own comments" 
    ON public.blog_comments FOR SELECT 
    USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can comment on published proposals" 
    ON public.blog_comments FOR INSERT 
    WITH CHECK (
        auth.uid() = author_id AND 
        EXISTS (
            SELECT 1 FROM public.blog_proposals 
            WHERE id = blog_comments.proposal_id AND status = 'published'
        )
    );

CREATE POLICY "Authors can update their own comments" 
    ON public.blog_comments FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments" 
    ON public.blog_comments FOR DELETE 
    USING (auth.uid() = author_id);

-- 8. Create indexes for better performance
CREATE INDEX idx_blog_proposals_author_id ON public.blog_proposals(author_id);
CREATE INDEX idx_blog_proposals_status ON public.blog_proposals(status);
CREATE INDEX idx_blog_proposals_created_at ON public.blog_proposals(created_at DESC);
CREATE INDEX idx_blog_proposals_category ON public.blog_proposals(category);
CREATE INDEX idx_blog_proposals_tags ON public.blog_proposals USING GIN(tags);

CREATE INDEX idx_blog_votes_proposal_id ON public.blog_votes(proposal_id);
CREATE INDEX idx_blog_votes_voter_id ON public.blog_votes(voter_id);
CREATE INDEX idx_blog_votes_proposal_voter ON public.blog_votes(proposal_id, voter_id);

CREATE INDEX idx_blog_comments_proposal_id ON public.blog_comments(proposal_id);
CREATE INDEX idx_blog_comments_author_id ON public.blog_comments(author_id);
CREATE INDEX idx_blog_comments_parent_id ON public.blog_comments(parent_comment_id);
CREATE INDEX idx_blog_comments_created_at ON public.blog_comments(created_at DESC);

-- 9. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_proposals_updated_at
    BEFORE UPDATE ON public.blog_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_votes_updated_at
    BEFORE UPDATE ON public.blog_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
    BEFORE UPDATE ON public.blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create materialized view for blog statistics
CREATE MATERIALIZED VIEW public.blog_proposal_stats AS
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
    COALESCE(vote_stats.upvotes, 0) AS upvotes,
    COALESCE(vote_stats.downvotes, 0) AS downvotes,
    COALESCE(vote_stats.total_votes, 0) AS total_votes,
    COALESCE(comment_stats.comment_count, 0) AS comment_count
FROM public.blog_proposals bp
LEFT JOIN public.profiles p ON bp.author_id = p.user_id
LEFT JOIN (
    SELECT 
        proposal_id,
        COUNT(CASE WHEN vote_type = 'upvote' THEN 1 END) AS upvotes,
        COUNT(CASE WHEN vote_type = 'downvote' THEN 1 END) AS downvotes,
        COUNT(*) AS total_votes
    FROM public.blog_votes
    GROUP BY proposal_id
) vote_stats ON bp.id = vote_stats.proposal_id
LEFT JOIN (
    SELECT 
        proposal_id,
        COUNT(*) AS comment_count
    FROM public.blog_comments
    GROUP BY proposal_id
) comment_stats ON bp.id = comment_stats.proposal_id;

-- Create index on the materialized view
CREATE INDEX idx_blog_proposal_stats_author_id ON public.blog_proposal_stats(author_id);
CREATE INDEX idx_blog_proposal_stats_status ON public.blog_proposal_stats(status);
CREATE INDEX idx_blog_proposal_stats_created_at ON public.blog_proposal_stats(created_at DESC);

-- Allow public read access to the materialized view for published proposals
CREATE POLICY "Anyone can view published proposal stats" 
    ON public.blog_proposal_stats FOR SELECT 
    USING (status = 'published');

-- Enable RLS on the materialized view
ALTER MATERIALIZED VIEW public.blog_proposal_stats ENABLE ROW LEVEL SECURITY;

-- 11. Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_blog_proposal_stats()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.blog_proposal_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh the materialized view when data changes
CREATE TRIGGER refresh_stats_on_proposal_change
    AFTER INSERT OR UPDATE OR DELETE ON public.blog_proposals
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_blog_proposal_stats();

CREATE TRIGGER refresh_stats_on_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON public.blog_votes
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_blog_proposal_stats();

CREATE TRIGGER refresh_stats_on_comment_change
    AFTER INSERT OR UPDATE OR DELETE ON public.blog_comments
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_blog_proposal_stats();
