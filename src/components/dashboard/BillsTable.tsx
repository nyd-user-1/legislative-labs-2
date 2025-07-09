import { useState } from "react";
import { AIChatSheet } from "@/components/AIChatSheet";
import { useFavorites } from "@/hooks/useFavorites";
import { BillsTableMobile } from "./BillsTableMobile";
import { BillsTableDesktop } from "./BillsTableDesktop";
import { Bill, BillsTableProps } from "./types";

export const BillsTable = ({ bills, onBillSelect }: BillsTableProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<Bill | null>(null);
  const { favoriteBillIds, toggleFavorite } = useFavorites();

  const handleAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setChatOpen(true);
  };

  const handleFavorite = async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(bill.bill_id);
  };

  return (
    <div className="w-full">
      <BillsTableMobile
        bills={bills}
        onBillSelect={onBillSelect}
        onAIAnalysis={handleAIAnalysis}
        onFavorite={handleFavorite}
        favoriteBillIds={favoriteBillIds}
      />

      <BillsTableDesktop
        bills={bills}
        onBillSelect={onBillSelect}
        onAIAnalysis={handleAIAnalysis}
        onFavorite={handleFavorite}
        favoriteBillIds={favoriteBillIds}
      />

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </div>
  );
};