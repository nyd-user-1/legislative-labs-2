
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sparkles } from "lucide-react";

interface Media {
  id: string;
  title: string;
  content: string;
  content_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MediaTableProps {
  media: Media[];
}

export const MediaTable = ({ media }: MediaTableProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'default';
      case 'in_review':
        return 'secondary';
      case 'published':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'in_review', label: 'In Review' },
    { value: 'published', label: 'Published' }
  ];

  const contentTypeOptions = [
    { value: 'press_release', label: 'Press Release' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'media_kit', label: 'Media Kit' }
  ];

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {media.map((mediaItem) => (
          <div key={mediaItem.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{mediaItem.title}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{mediaItem.content}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <Badge variant={getStatusBadgeVariant(mediaItem.status)}>
                {mediaItem.status}
              </Badge>
              <span>{formatDate(mediaItem.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View with Proper Horizontal Scroll Containment */}
      <div className="hidden md:block">
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <Table className="min-w-[800px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] whitespace-nowrap">Media Title</TableHead>
                  <TableHead className="min-w-[300px] whitespace-nowrap">Content Preview</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Type</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Last Action</TableHead>
                  <TableHead className="min-w-[120px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {media.map((mediaItem) => (
                  <TableRow
                    key={mediaItem.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {mediaItem.title}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={mediaItem.content}>
                        {mediaItem.content}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select defaultValue={mediaItem.status}>
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>
                            <Badge variant={getStatusBadgeVariant(mediaItem.status)}>
                              {mediaItem.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select defaultValue={mediaItem.content_type}>
                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 focus:ring-0">
                          <SelectValue>
                            {contentTypeOptions.find(opt => opt.value === mediaItem.content_type)?.label || mediaItem.content_type}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(mediaItem.updated_at)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Add to Favorites"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="AI Analysis"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {media.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No media found
        </div>
      )}
    </div>
  );
};
