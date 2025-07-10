
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles } from "lucide-react";
import { Bill } from "./types";

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
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {bill.bill_number || "No Number"}
              </span>
            </div>
          </div>
          
          {/* Combined buttons in top right */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>
        
        {/* Description moved to bottom with full width and 3-line limit */}
        {bill.title && (
          <div className="w-full">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-tight">
              {bill.title}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
