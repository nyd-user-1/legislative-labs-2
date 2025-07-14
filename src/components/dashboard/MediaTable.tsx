
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const getContentTypeBadgeVariant = (contentType: string) => {
    switch (contentType?.toLowerCase()) {
      case 'press_release':
        return 'default';
      case 'social_media':
        return 'secondary';
      case 'newsletter':
        return 'outline';
      default:
        return 'secondary';
    }
  };

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
              <div className="flex gap-2">
                <Badge variant={getStatusBadgeVariant(mediaItem.status)}>
                  {mediaItem.status}
                </Badge>
                <Badge variant={getContentTypeBadgeVariant(mediaItem.content_type)}>
                  {mediaItem.content_type}
                </Badge>
              </div>
              <span>{formatDate(mediaItem.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Media Title</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Action</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {media.map((mediaItem) => (
              <TableRow
                key={mediaItem.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {mediaItem.title}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={mediaItem.content}>
                    {mediaItem.content}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(mediaItem.status)}>
                    {mediaItem.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getContentTypeBadgeVariant(mediaItem.content_type)}>
                    {mediaItem.content_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(mediaItem.updated_at)}
                </TableCell>
                <TableCell className="text-right">
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

      {media.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No media found
        </div>
      )}
    </div>
  );
};
