
import React, { useState, useEffect, useMemo } from "react";
import { BillCard } from "./BillCard";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { AIChatSheet } from "@/components/AIChatSheet";

type Bill = Tables<"Bills">;

interface OptimizedBillsGridProps {
  bills: Bill[];
  onBillSelect: (bill: Bill) => void;
}

// Memoized BillCard to prevent unnecessary re-renders
const MemoizedBillCard = React.memo(({ 
  bill, 
  onBillSelect, 
  onAIAnalysis, 
  onFavorite, 
  isFavorited, 
  hasAIChat 
}: {
  bill: Bill;
  onBillSelect: (bill: Bill) => void;
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  isFavorited: boolean;
  hasAIChat: boolean;
}) => (
  <BillCard
    bill={bill}
    onBillSelect={onBillSelect}
    onAIAnalysis={onAIAnalysis}
    onFavorite={onFavorite}
    isFavorited={isFavorited}
    hasAIChat={hasAIChat}
  />
));

MemoizedBillCard.displayName = 'MemoizedBillCard';

export const OptimizedBillsGrid = React.memo(({ bills, onBillSelect }: OptimizedBillsGridProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<Bill | null>(null);
  const [billsWithAIChat, setBillsWithAIChat] = useState<Set<number>>(new Set());
  const { favoriteBillIds, toggleFavorite } = useFavorites();

  // Memoize bills with AI chat fetch to prevent unnecessary API calls
  const fetchBillsWithAIChat = useMemo(() => async () => {
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
  }, []);

  useEffect(() => {
    fetchBillsWithAIChat();
  }, [fetchBillsWithAIChat]);

  const handleAIAnalysis = React.useCallback((bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setChatOpen(true);
    
    // Add this bill to the set of bills with AI chat
    setBillsWithAIChat(prev => new Set([...prev, bill.bill_id]));
  }, []);

  const handleFavorite = React.useCallback(async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(bill.bill_id);
  }, [toggleFavorite]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((bill) => (
          <MemoizedBillCard
            key={bill.bill_id}
            bill={bill}
            onBillSelect={onBillSelect}
            onAIAnalysis={handleAIAnalysis}
            onFavorite={handleFavorite}
            isFavorited={favoriteBillIds.has(bill.bill_id)}
            hasAIChat={billsWithAIChat.has(bill.bill_id)}
          />
        ))}
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </>
  );
});

OptimizedBillsGrid.displayName = 'OptimizedBillsGrid';
