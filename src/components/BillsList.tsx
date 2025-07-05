import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ExternalLink, Calendar, User } from "lucide-react";
import { BillStatusBadge } from "./BillStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

interface BillsListProps {
  filters: {
    search: string;
    status: string;
    committee: string;
    dateRange: string;
  };
  onBillSelect: (bill: Bill) => void;
}

export const BillsList = ({ filters, onBillSelect }: BillsListProps) => {
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

      let query = supabase.from("Bills").select("*");

      // Apply search filter
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,bill_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq("status", parseInt(filters.status));
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
      query = query.order("last_action_date", { ascending: false, nullsFirst: false });

      // Limit results for performance
      query = query.limit(100);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

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
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchBills} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Bills
          <span className="text-sm font-normal text-muted-foreground">
            {bills.length} result{bills.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-[600px] px-6 pb-6">
          {bills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bills found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <Card key={bill.bill_id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg leading-tight">
                            {bill.bill_number && (
                              <span className="text-primary mr-2">{bill.bill_number}</span>
                            )}
                            {bill.title || "Untitled Bill"}
                          </h3>
                          {bill.description && (
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                              {bill.description}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {bill.status !== null && (
                            <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {bill.committee && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{bill.committee}</span>
                          </div>
                        )}
                        {bill.last_action_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(bill.last_action_date)}</span>
                          </div>
                        )}
                      </div>

                      {bill.last_action && (
                        <div className="bg-muted/50 rounded-md p-2">
                          <p className="text-sm">
                            <span className="font-medium">Last Action:</span> {bill.last_action}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => onBillSelect(bill)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {bill.url && (
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
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};