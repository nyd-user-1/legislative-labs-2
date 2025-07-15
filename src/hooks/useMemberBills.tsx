import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

interface MemberBill extends Bill {
  sponsor_position?: number;
}

export const useMemberBills = (memberId: number) => {
  const [bills, setBills] = useState<MemberBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (memberId) {
      fetchMemberBills();
    }
  }, [memberId]);

  const fetchMemberBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query bills where the member is the primary sponsor (position 1)
      const { data, error } = await supabase
        .from("Sponsors")
        .select(`
          position,
          Bills (
            bill_id,
            bill_number,
            title,
            status,
            status_desc,
            committee,
            last_action,
            last_action_date,
            description,
            state_link,
            url
          )
        `)
        .eq("people_id", memberId)
        .eq("position", 1) // Primary sponsor only
        .order("position", { ascending: true });

      if (error) throw error;

      // Transform the data to flatten the Bills structure
      const memberBills = data?.map(sponsor => {
        const bill = sponsor.Bills as any;
        if (!bill) return null;
        return {
          bill_id: bill.bill_id,
          bill_number: bill.bill_number,
          title: bill.title,
          status: bill.status,
          status_desc: bill.status_desc,
          committee: bill.committee,
          last_action: bill.last_action,
          last_action_date: bill.last_action_date,
          description: bill.description,
          state_link: bill.state_link,
          url: bill.url,
          sponsor_position: sponsor.position
        } as MemberBill;
      }).filter(bill => bill !== null && bill.bill_id) || [];

      setBills(memberBills);
    } catch (err) {
      console.error("Error fetching member bills:", err);
      setError("Failed to load member bills. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load member bills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    bills,
    loading,
    error,
    refetch: fetchMemberBills,
  };
};