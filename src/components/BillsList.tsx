import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ExternalLink, Calendar, User } from "lucide-react";
import { BillStatusBadge } from "./BillStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
type Bill = Tables<"Bills">;
interface BillsListProps {
  filters: {
    search: string;
    sponsor: string;
    committee: string;
    dateRange: string;
  };
  onBillSelect: (bill: Bill) => void;
}
export const BillsList = ({
  filters,
  onBillSelect
}: BillsListProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchBills();
  }, [filters]);
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching bills with filters:", filters);
      let query = supabase.from("Bills").select("*");

      // Apply search filter
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,bill_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sponsor filter  
      if (filters.sponsor) {
        // First get bills that have sponsors matching the filter
        const {
          data: sponsorBills
        } = await supabase.from("Sponsors").select("bill_id, People!inner(name)").eq("People.name", filters.sponsor);
        if (sponsorBills && sponsorBills.length > 0) {
          const billIds = sponsorBills.map(sb => sb.bill_id);
          query = query.in("bill_id", billIds);
        } else {
          // No bills found for this sponsor, return empty result
          setBills([]);
          return;
        }
      }

      // Apply committee filter
      if (filters.committee) {
        query = query.eq("committee", filters.committee);
      }

      // Apply date filter
      if (filters.dateRange) {
        const daysAgo = parseInt(filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        query = query.gte("last_action_date", cutoffDate.toISOString().split('T')[0]);
      }

      // Order by last action date, most recent first
      query = query.order("last_action_date", {
        ascending: false,
        nullsFirst: false
      });

      // Limit results for performance
      query = query.limit(100);
      const {
        data,
        error
      } = await query;
      if (error) {
        console.error("Query error:", error);
        throw error;
      }
      console.log("Bills fetched successfully:", data?.length || 0, "bills");
      setBills(data || []);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError("Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2 p-6 border rounded-lg">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchBills} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {bills.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No bills found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map(bill => (
            <Card key={bill.bill_id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-xl">
                    {bill.bill_number || "No Number"}
                  </h3>
                  <div className="flex-shrink-0">
                    {bill.status !== null && (
                      <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
                    )}
                  </div>
                </div>

                {bill.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {bill.description}
                  </p>
                )}

                <div className="space-y-2">
                  {bill.committee && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{bill.committee}</span>
                    </div>
                  )}
                  {bill.last_action_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(bill.last_action_date)}</span>
                    </div>
                  )}
                </div>

                {bill.url && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(bill.url!, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};