
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { BillsTableDesktop } from "./BillsTableDesktop";
import { BillsTableMobile } from "./BillsTableMobile";
import { AllItemsTable } from "./AllItemsTable";
import { useFavorites } from "@/hooks/useFavorites";
import { AIChatSheet } from "@/components/AIChatSheet";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface DashboardTabsSectionProps {
  bills: Bill[];
}

export const DashboardTabsSection = ({ bills }: DashboardTabsSectionProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<Bill | null>(null);
  const [billsWithAIChat, setBillsWithAIChat] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { favoriteBillIds, toggleFavorite } = useFavorites();

  // Fetch bills that have AI chat sessions
  useEffect(() => {
    const fetchBillsWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("bill_id")
          .not("bill_id", "is", null);

        if (sessions) {
          const billIdsWithChat = new Set(
            sessions.map(session => session.bill_id).filter(Boolean)
          );
          setBillsWithAIChat(billIdsWithChat);
        }
      } catch (error) {
        console.error("Error fetching AI chat sessions:", error);
      }
    };

    fetchBillsWithAIChat();
  }, []);

  // Set loading to false after bills are loaded
  useEffect(() => {
    setLoading(false);
  }, [bills]);

  const handleAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setChatOpen(true);
    
    // Add this bill to the set of bills with AI chat
    setBillsWithAIChat(prev => new Set([...prev, bill.bill_id]));
  };

  const handleFavorite = async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(bill.bill_id);
  };

  const handleBillSelect = (bill: Bill) => {
    // Navigate to bill detail page
    window.location.href = `/bills?selected=${bill.bill_id}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-full"></div>
            <div className="h-40 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="bill" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bill">Bills</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <AllItemsTable 
                bills={bills}
                problems={[]}
                solutions={[]}
                media={[]}
                onBillSelect={handleBillSelect}
                onAIAnalysis={handleAIAnalysis}
                onFavorite={handleFavorite}
                favoriteBillIds={favoriteBillIds}
                billsWithAIChat={billsWithAIChat}
              />
            </TabsContent>

            <TabsContent value="bill" className="mt-6">
              <div className="w-full">
                <BillsTableMobile
                  bills={bills}
                  onBillSelect={handleBillSelect}
                  onAIAnalysis={handleAIAnalysis}
                  onFavorite={handleFavorite}
                  favoriteBillIds={favoriteBillIds}
                  billsWithAIChat={billsWithAIChat}
                />

                <BillsTableDesktop
                  bills={bills}
                  onBillSelect={handleBillSelect}
                  onAIAnalysis={handleAIAnalysis}
                  onFavorite={handleFavorite}
                  favoriteBillIds={favoriteBillIds}
                  billsWithAIChat={billsWithAIChat}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </>
  );
};
