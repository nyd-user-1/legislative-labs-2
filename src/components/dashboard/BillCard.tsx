import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles } from "lucide-react";
import { Bill } from "./types";
import { getStatusBadgeVariant } from "./utils";

interface BillCardProps {
  bill: Bill;
  onBillSelect?: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  isFavorited: boolean;
}

export const BillCard = ({
  bill,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  isFavorited
}: BillCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onBillSelect && onBillSelect(bill)}
    >
      <CardContent className="p-4 min-h-[120px] flex flex-col">
        <div className="flex items-start justify-between gap-3 flex-1">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {bill.bill_number || "No Number"}
              </span>
            </div>
            <h3 className="font-medium text-sm leading-tight line-clamp-2">
              {bill.title || "No Title"}
            </h3>
          </div>
          <Badge variant={getStatusBadgeVariant(bill.status_desc)} className="text-xs flex-shrink-0">
            {bill.status_desc || "Unknown"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-end gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            onClick={(e) => onFavorite(bill, e)}
            title="Add to Favorites"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            onClick={(e) => onAIAnalysis(bill, e)}
            title="AI Analysis"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};