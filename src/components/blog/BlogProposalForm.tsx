
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { CreateBlogProposalRequest, UpdateBlogProposalRequest } from '@/types/blog';

const proposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  summary: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface BlogProposalFormProps {
  initialData?: Partial<CreateBlogProposalRequest>;
  onSubmit: (data: CreateBlogProposalRequest | UpdateBlogProposalRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CATEGORIES = [
  'Healthcare',
  'Education',
  'Environment',
  'Economy',
  'Transportation',
  'Housing',
  'Technology',
  'Social Justice',
  'Other'
];

export const BlogProposalForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}: BlogProposalFormProps) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [currentTag, setCurrentTag] = useState('');

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      summary: initialData?.summary || '',
      category: initialData?.category || '',
      status: initialData?.status || 'draft',
    },
  });

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (data: ProposalFormData) => {
    await onSubmit({ ...data, tags });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter proposal title..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Brief summary of your proposal..."
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Write your detailed proposal here..."
                  rows={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (Optional)</label>
          <div className="flex gap-2">
            <Input
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Proposal'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
