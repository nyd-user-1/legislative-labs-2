import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
type Bill = Tables<"Bills">;
type Sponsor = Tables<"Sponsors"> & {
  person?: Tables<"People">;
};
interface BillKeyInformationProps {
  bill: Bill;
  sponsors: Sponsor[];
  totalSponsors: number;
}
export const BillKeyInformation = ({
  bill,
  sponsors,
  totalSponsors
}: BillKeyInformationProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };
  return <Card className="card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <CardHeader className="card-header px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">Key Information</CardTitle>
      </CardHeader>
      <CardContent className="card-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Bill Type</h4>
              <p className="text-sm font-medium">
                {bill.bill_number?.startsWith('S') ? 'Senate Bill' : bill.bill_number?.startsWith('A') ? 'Assembly Bill' : 'Unknown'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Total Sponsors</h4>
              <p className="text-sm font-medium">{totalSponsors}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Status Date</h4>
              <p className="text-sm">{formatDate(bill.status_date)}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Last Action Date</h4>
              <p className="text-sm">{formatDate(bill.last_action_date)}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              
              <p className="text-sm">{bill.session_id || "Not specified"}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Committee ID</h4>
              <p className="text-sm">{bill.committee_id || "Not assigned"}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {bill.state_link && <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">State Link</h4>
                <a href={bill.state_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
                  View on NY Senate
                </a>
              </div>}
            
            {bill.url && <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Bill URL</h4>
                <a href={bill.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Official Link
                </a>
              </div>}
          </div>
        </div>
        
        {bill.last_action && <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Last Action</h4>
            <p className="text-sm leading-relaxed text-gray-700">
              {bill.last_action}
            </p>
          </div>}
      </CardContent>
    </Card>;
};