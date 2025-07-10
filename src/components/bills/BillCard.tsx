
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, MapPin, Heart, Sparkles } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface BillCardProps {
  bill: Bill;
  onBillSelect: (bill: Bill) => void;
  onAIAnalysis?: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite?: (bill: Bill, e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
}

export const BillCard = ({ 
  bill, 
  onBillSelect, 
  onAIAnalysis, 
  onFavorite, 
  isFavorited = false, 
  hasAIChat = false 
}: BillCardProps) => {
  // Get primary sponsor (first one)
  const primarySponsor = bill.sponsors?.[0];

  return (
    <Card 
      className="card hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={() => onBillSelect(bill)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {bill.bill_number || "No Number"}
            </h3>
          </div>
          
          {/* Combined buttons in top right */}
          {(onFavorite || onAIAnalysis) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {onFavorite && (
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={(e) => onFavorite(bill, e)}
                  title="Add to Favorites"
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              )}
              {onAIAnalysis && (
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={(e) => onAIAnalysis(bill, e)}
                  title="AI Analysis"
                >
                  <Sparkles className={`h-4 w-4 ${hasAIChat ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-6">
          <div className="space-y-2 pt-2 border-t">
            {primarySponsor?.name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate font-medium">{primarySponsor.name}</span>
                {primarySponsor.party && (
                  <span className="text-muted-foreground">({primarySponsor.party})</span>
                )}
              </div>
            )}

            {bill.last_action_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{formatDate(bill.last_action_date)}</span>
              </div>
            )}

            {bill.last_action && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{bill.last_action}</span>
              </div>
            )}
          </div>

          {/* Description section with proper spacing */}
          <div className="relative">
            {bill.title && (
              <p className="text-sm text-muted-foreground line-clamp-3 pr-8">
                {bill.title}
              </p>
            )}
            
            {/* View Full Text icon positioned at bottom right */}
            {bill.url && (
              <a
                href={bill.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-0 right-0 p-1 text-primary hover:text-primary/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="View Full Text"
              >
                <FileText className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
