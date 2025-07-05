import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

console.log("Bills.tsx file is loading");

const Bills = () => {
  console.log("Bills page component rendering");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Bills useEffect running - fetching bills...");
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      console.log("Starting bill fetch from Supabase...");
      
      const { data, error } = await supabase
        .from("Bills")
        .select("*")
        .order("introduced_date", { ascending: false })
        .limit(20);

      console.log("Supabase response:", { data, error });

      if (error) {
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} bills`);
      setBills(data || []);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  console.log("Bills component state:", { billsCount: bills.length, loading, error });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Legislative Bills</h1>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">Track legislative progress and details</p>
            </div>
          </div>
        </header>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Legislative Bills</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Debug version - checking if Bills component renders
            </p>
          </div>

          {/* Debug Information */}
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Bills loaded: {bills.length}</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p>Loading bills...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {error}</p>
              <Button onClick={fetchBills} className="mt-4">
                Retry
              </Button>
            </div>
          )}

          {/* Bills List */}
          {!loading && !error && bills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Bills ({bills.length})</h2>
              {bills.map((bill) => (
                <div key={bill.id} className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold">{bill.bill_num}</h3>
                  <p className="text-sm text-gray-600">{bill.title}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Status: {bill.status} | Chamber: {bill.chamber}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Bills */}
          {!loading && !error && bills.length === 0 && (
            <div className="text-center py-8">
              <p>No bills found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bills;
