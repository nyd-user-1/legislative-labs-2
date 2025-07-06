import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, BookOpen, MapPin } from "lucide-react";
import { BillStatusBadge } from "@/components/BillStatusBadge";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Bill = Tables<"Bills">;

interface BillCardProps {
  bill: Bill;
  onBillSelect: (bill: Bill) => void;
}

export const BillCard = ({ bill, onBillSelect }: BillCardProps) => {
  return (
    <Card className="card-interactive">
      <CardHeader className="card-header">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground mb-1">
              {bill.bill_number || "No Number"}
            </h3>
            {bill.title && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {bill.title}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            {bill.status !== null && (
              <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="card-body">
        <div className="space-y-3">
          {bill.committee && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{bill.committee}</span>
            </div>
          )}

          {bill.last_action_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(bill.last_action_date)}</span>
            </div>
          )}

          {bill.last_action && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{bill.last_action}</span>
            </div>
          )}

          {bill.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-3">
              {bill.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 mt-4 border-t border-border">
            {bill.url ? (
              <button 
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(bill.url!, '_blank');
                }}
              >
                <BookOpen className="h-4 w-4" />
                <span>View text</span>
              </button>
            ) : (
              <div />
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              className="btn-icon"
              onClick={() => onBillSelect(bill)} 
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};