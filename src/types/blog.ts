
export interface BlogProposal {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  view_count: number;
  is_featured: boolean;
}

export interface BlogVote {
  id: string;
  proposal_id: string;
  voter_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  proposal_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  edited_at?: string;
}

export interface BlogProposalStats {
  id: string;
  title: string;
  author_id: string;
  username?: string;
  display_name?: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  created_at: string;
  published_at?: string;
  view_count: number;
  is_featured: boolean;
  upvotes: number;
  downvotes: number;
  total_votes: number;
  comment_count: number;
}

export interface CreateBlogProposalRequest {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface UpdateBlogProposalRequest {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}
