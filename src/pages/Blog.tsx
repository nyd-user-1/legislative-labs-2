
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BlogProposalCard } from '@/components/blog/BlogProposalCard';
import { BlogProposalForm } from '@/components/blog/BlogProposalForm';
import { useBlogProposals } from '@/hooks/useBlogProposals';
import { BlogProposalStats } from '@/types/blog';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Blog = () => {
  const { proposals, loading, createProposal, updateProposal, deleteProposal } = useBlogProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<BlogProposalStats | null>(null);

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || proposal.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(proposals.map(p => p.category).filter(Boolean)));

  const handleView = (proposal: BlogProposalStats) => {
    // Navigate to proposal detail page
    console.log('View proposal:', proposal);
  };

  const handleEdit = (proposal: BlogProposalStats) => {
    setEditingProposal(proposal);
    setShowForm(true);
  };

  const handleDelete = async (proposal: BlogProposalStats) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      await deleteProposal(proposal.id);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProposal) {
        await updateProposal(editingProposal.id, data);
      } else {
        await createProposal(data);
      }
      setShowForm(false);
      setEditingProposal(null);
    } catch (error) {
      console.error('Error saving proposal:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProposal(null);
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Public Policy Blog</h1>
            <p className="text-gray-600 mt-2">Share and discuss policy proposals</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Proposal
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search proposals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{proposals.length}</div>
              <div className="text-sm text-gray-600">Total Proposals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {proposals.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {proposals.reduce((sum, p) => sum + p.total_votes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {proposals.reduce((sum, p) => sum + p.comment_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredProposals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-500">No proposals found matching your criteria.</div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProposals.map((proposal) => (
                  <BlogProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProposal ? 'Edit Proposal' : 'Create New Proposal'}
              </DialogTitle>
            </DialogHeader>
            <BlogProposalForm
              initialData={editingProposal ? {
                title: editingProposal.title,
                category: editingProposal.category,
                status: editingProposal.status,
              } : undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Blog;
