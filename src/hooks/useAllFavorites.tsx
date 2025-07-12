import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;
type Member = Tables<"People">;

export interface FavoriteBill {
  id: string;
  bill_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  bill: Bill;
}

export interface FavoriteMember {
  id: string;
  member_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  member: Member;
}

export const useAllFavorites = () => {
  const [favoriteBills, setFavoriteBills] = useState<FavoriteBill[]>([]);
  const [favoriteMembers, setFavoriteMembers] = useState<FavoriteMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllFavorites();
  }, []);

  const fetchAllFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch favorite bills
      const { data: billFavorites, error: billError } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (billError) throw billError;

      // Fetch bills data for favorites
      const billIds = billFavorites?.map(fav => fav.bill_id) || [];
      let billsData: Bill[] = [];
      if (billIds.length > 0) {
        const { data: bills, error: billsError } = await supabase
          .from("Bills")
          .select("*")
          .in("bill_id", billIds);
        
        if (billsError) throw billsError;
        billsData = bills || [];
      }

      // Fetch favorite members
      const { data: memberFavorites, error: memberError } = await supabase
        .from("user_member_favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (memberError) throw memberError;

      // Fetch members data for favorites
      const memberIds = memberFavorites?.map(fav => fav.member_id) || [];
      let membersData: Member[] = [];
      if (memberIds.length > 0) {
        const { data: members, error: membersError } = await supabase
          .from("People")
          .select("*")
          .in("people_id", memberIds);
        
        if (membersError) throw membersError;
        membersData = members || [];
      }

      // Combine favorites with their related data
      const formattedBillFavorites: FavoriteBill[] = billFavorites?.map(fav => ({
        ...fav,
        bill: billsData.find(bill => bill.bill_id === fav.bill_id)!
      })).filter(fav => fav.bill) || [];

      const formattedMemberFavorites: FavoriteMember[] = memberFavorites?.map(fav => ({
        ...fav,
        member: membersData.find(member => member.people_id === fav.member_id)!
      })).filter(fav => fav.member) || [];

      setFavoriteBills(formattedBillFavorites);
      setFavoriteMembers(formattedMemberFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeBillFavorite = async (billId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("bill_id", billId);

      if (error) throw error;

      setFavoriteBills(prev => prev.filter(fav => fav.bill.bill_id !== billId));
      
      toast({
        title: "Removed from favorites",
        description: "Bill removed from your favorites",
      });
    } catch (error) {
      console.error("Error removing bill favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    }
  };

  const removeMemberFavorite = async (memberId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_member_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("member_id", memberId);

      if (error) throw error;

      setFavoriteMembers(prev => prev.filter(fav => fav.member.people_id !== memberId));
      
      toast({
        title: "Removed from favorites",
        description: "Member removed from your favorites",
      });
    } catch (error) {
      console.error("Error removing member favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    }
  };

  return {
    favoriteBills,
    favoriteMembers,
    loading,
    removeBillFavorite,
    removeMemberFavorite,
    refetch: fetchAllFavorites,
  };
};