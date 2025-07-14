
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { BillsTableDesktop } from "./BillsTableDesktop";
import { BillsTableMobile } from "./BillsTableMobile";
import { ProblemsTable } from "./ProblemsTable";
import { SolutionsTable } from "./SolutionsTable";
import { MediaTable } from "./MediaTable";
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
  const [problems, setProblems] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
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

  // Fetch problems, solutions, and media
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch problems
        const { data: problemsData } = await supabase
          .from("problem_chats")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch solutions (legislative drafts)
        const { data: solutionsData } = await supabase
          .from("legislative_drafts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch media
        const { data: mediaData } = await supabase
          .from("media_outputs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        setProblems(problemsData || []);
        setSolutions(solutionsData || []);
        setMedia(mediaData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setChatOpen(true);
    
    // Add this bill to the set of bills with AI chat
    setBillsWithAIChat(prev => new Set([...prev, bill.bill_id]));
  };

  const handleFavorite = async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    // Automatic saving - no need for user confirmation
    await toggleFavorite(bill.bill_id);
  };

  const handleBillSelect = (bill: Bill) => {
    // Navigate to bill detail page
    window.location.href = `/bills?selected=${bill.bill_id}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bill">Bill</TabsTrigger>
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <AllItemsTable 
                bills={bills}
                problems={problems}
                solutions={solutions}
                media={media}
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

            <TabsContent value="problem" className="mt-6">
              <ProblemsTable problems={problems} />
            </TabsContent>

            <TabsContent value="solution" className="mt-6">
              <SolutionsTable solutions={solutions} />
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <MediaTable media={media} />
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
