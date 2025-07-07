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
    <Card 
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onBillSelect(bill)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {bill.bill_number || "No Number"}
            </h3>
          </div>
          
          {bill.status !== null && (
            <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
          )}
        </div>
        
        {bill.title && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bill.title}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2 pt-2 border-t">
            {bill.committee && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{bill.committee}</span>
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

            {bill.url && (
              <div className="pt-1">
                <a
                  href={bill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BookOpen className="h-3 w-3" />
                  View Full Text
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};