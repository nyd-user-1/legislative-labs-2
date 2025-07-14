
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import { Bill } from "./types";

interface AllItemsTableProps {
  bills: Bill[];
  problems: any[];
  solutions: any[];
  media: any[];
  onBillSelect?: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  favoriteBillIds: Set<number>;
  billsWithAIChat?: Set<number>;
}

type AllItem = {
  id: string;
  type: 'bill' | 'problem' | 'solution' | 'media';
  title: string;
  description: string;
  status: string;
  category: string;
  lastAction: string;
  data: any;
};

export const AllItemsTable = ({
  bills,
  problems,
  solutions,
  media,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  favoriteBillIds,
  billsWithAIChat = new Set()
}: AllItemsTableProps) => {
  
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
      case 'introduced':
      case 'draft':
      case 'problem identified':
        return 'default';
      case 'in_review':
      case 'in progress':
        return 'secondary';
      case 'published':
      case 'resolved':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Combine all items into a single array
  const allItems: AllItem[] = [
    ...bills.slice(0, 5).map(bill => ({
      id: bill.bill_id.toString(),
      type: 'bill' as const,
      title: bill.bill_number || 'No Number',
      description: bill.title || 'No Title',
      status: bill.status_desc || 'Unknown',
      category: bill.committee || 'N/A',
      lastAction: bill.last_action || 'No recent action',
      data: bill
    })),
    ...problems.slice(0, 3).map(problem => ({
      id: problem.id,
      type: 'problem' as const,
      title: problem.problem_number,
      description: problem.problem_statement,
      status: problem.current_state,
      category: 'General',
      lastAction: formatDate(problem.updated_at),
      data: problem
    })),
    ...solutions.slice(0, 3).map(solution => ({
      id: solution.id,
      type: 'solution' as const,
      title: solution.title,
      description: solution.draft_content,
      status: solution.status,
      category: solution.type || 'Legislative Draft',
      lastAction: formatDate(solution.updated_at),
      data: solution
    })),
    ...media.slice(0, 3).map(mediaItem => ({
      id: mediaItem.id,
      type: 'media' as const,
      title: mediaItem.title,
      description: mediaItem.content,
      status: mediaItem.status,
      category: mediaItem.content_type,
      lastAction: formatDate(mediaItem.updated_at),
      data: mediaItem
    }))
  ].sort((a, b) => {
    // Sort by last action date, most recent first
    if (a.type === 'bill' && b.type === 'bill') {
      const aDate = a.data.last_action_date || a.data.created_at;
      const bDate = b.data.last_action_date || b.data.created_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    // For non-bills, sort by updated_at
    const aDate = a.data.updated_at || a.data.created_at;
    const bDate = b.data.updated_at || b.data.created_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bill':
        return '📋';
      case 'problem':
        return '❓';
      case 'solution':
        return '💡';
      case 'media':
        return '📢';
      default:
        return '📄';
    }
  };

  const handleItemClick = (item: AllItem) => {
    if (item.type === 'bill' && onBillSelect) {
      onBillSelect(item.data);
    }
    // Add navigation logic for other types as needed
  };

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {allItems.map((item) => (
          <div 
            key={`${item.type}-${item.id}`} 
            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span>{getTypeIcon(item.type)}</span>
                <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
              </div>
              {item.type === 'bill' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => onFavorite(item.data, e)}
                  >
                    <Heart className={`h-4 w-4 ${favoriteBillIds.has(item.data.bill_id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => onAIAnalysis(item.data, e)}
                  >
                    <Sparkles className={`h-4 w-4 ${billsWithAIChat.has(item.data.bill_id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status}
                </Badge>
              </div>
              <span>{item.lastAction}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title/Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Last Action</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allItems.map((item) => (
              <TableRow
                key={`${item.type}-${item.id}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleItemClick(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(item.type)}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.type}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {item.title}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={item.description}>
                    {item.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.lastAction}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.type === 'bill' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => onFavorite(item.data, e)}
                          title="Add to Favorites"
                        >
                          <Heart className={`h-4 w-4 ${favoriteBillIds.has(item.data.bill_id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => onAIAnalysis(item.data, e)}
                          title="AI Analysis"
                        >
                          <Sparkles className={`h-4 w-4 ${billsWithAIChat.has(item.data.bill_id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        </Button>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {allItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items found
        </div>
      )}
    </div>
  );
};
