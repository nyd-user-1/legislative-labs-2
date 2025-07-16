
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useNYSBillText } from "@/hooks/useNYSBillText";
import { BillTextContent } from "./BillTextContent";

interface BillTextProps {
  billId: string;
  className?: string;
}

export const BillTextDisplay = ({ billId, className }: BillTextProps) => {
  // Convert bill ID to bill number format expected by NYS API
  // This might need adjustment based on your data structure
  const billNumber = billId.toString();
  
  const { billText, loading, error } = useNYSBillText(billNumber);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bill Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bill Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Unable to Load Bill Text</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!billText) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bill Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No bill text available for this legislation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">Bill Text</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <BillTextContent billText={billText} />
      </CardContent>
    </Card>
  );
};
