import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { FileText, Users, Building2, CheckCircle } from "lucide-react";

interface BillWithSponsor extends Tables<"Bills"> {
  sponsor_name?: string;
  sponsor_id?: string;
}

interface HistoryEntry {
  action: string;
  bill_id: number;
  chamber: string | null;
  date: string;
  sequence: number;
}

interface JourneyEvent {
  id: number;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "pending";
}

interface AnalysisCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  items: Array<{
    name: string;
    level: string;
    value: number;
    description: string;
  }>;
}

export const useBillDetailData = (billId: string | undefined) => {
  const [bill, setBill] = useState<BillWithSponsor | null>(null);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create journey events from history data
  const journeyEvents: JourneyEvent[] = historyData.map((entry, index) => ({
    id: entry.sequence,
    date: new Date(entry.date).toLocaleDateString(),
    title: entry.action || "Unknown Action",
    subtitle: entry.chamber || "Unknown Chamber",
    description: `Legislative action taken: ${entry.action}`,
    icon: index === 0 ? <FileText className="h-4 w-4 text-white" /> :
          index === 1 ? <Building2 className="h-4 w-4 text-white" /> :
          index === 2 ? <Users className="h-4 w-4 text-white" /> :
          <CheckCircle className="h-4 w-4 text-white" />,
    status: index < historyData.length - 1 ? "completed" as const : 
            index === historyData.length - 1 ? "current" as const : "pending" as const,
  }));

  const analysisCategories: AnalysisCategory[] = [
    {
      id: "summary",
      name: "Summary",
      icon: null,
      description: "Fiscal and social impact analysis for this legislative proposal",
      items: [
        {
          name: "Fiscal Impact",
          level: "High",
          value: 85,
          description: "Estimated budget impact and implementation costs",
        },
        {
          name: "Public Benefit",
          level: "Medium",
          value: 70,
          description: "Expected positive impact on affected communities",
        },
        {
          name: "Implementation Timeline",
          level: "Advanced",
          value: 80,
          description: "Complexity and timeframe for implementation",
        },
        {
          name: "Stakeholder Support",
          level: "Expert",
          value: 90,
          description: "Level of support from key stakeholder groups",
        },
        {
          name: "Legal Compliance",
          level: "Proficient",
          value: 75,
          description: "Alignment with existing legal framework",
        },
        {
          name: "Public Opinion",
          level: "Advanced",
          value: 85,
          description: "Public support and awareness of the proposal",
        },
      ],
    },
    {
      id: "sponsors",
      name: "Sponsors",
      icon: null,
      description: "Legislative history and precedent for similar proposals",
      items: [
        {
          name: "Previous Attempts",
          level: "Expert",
          value: 90,
          description: "History of similar legislative efforts and outcomes",
        },
        {
          name: "Related Legislation",
          level: "Advanced",
          value: 85,
          description: "Connection to existing laws and regulations",
        },
        {
          name: "Amendment History",
          level: "Proficient",
          value: 75,
          description: "Changes made during the legislative process",
        },
        {
          name: "Committee Precedent",
          level: "Advanced",
          value: 80,
          description: "Historical committee treatment of similar bills",
        },
        {
          name: "Judicial Review",
          level: "Intermediate",
          value: 65,
          description: "Court decisions on related legal matters",
        },
        {
          name: "Implementation Examples",
          level: "Proficient",
          value: 70,
          description: "Examples from other jurisdictions",
        },
      ],
    },
    {
      id: "co-sponsors",
      name: "Co-Sponsors",
      icon: null,
      description: "Political dynamics and stakeholder positions on the proposal",
      items: [
        {
          name: "Bipartisan Support",
          level: "Advanced",
          value: 80,
          description: "Cross-party support for the legislative proposal",
        },
        {
          name: "Interest Group Positions",
          level: "Expert",
          value: 85,
          description: "Advocacy organization stances and lobbying efforts",
        },
        {
          name: "Media Coverage",
          level: "Proficient",
          value: 75,
          description: "Public attention and media reporting on the bill",
        },
        {
          name: "Electoral Implications",
          level: "Advanced",
          value: 80,
          description: "Potential impact on upcoming elections",
        },
        {
          name: "Coalition Building",
          level: "Intermediate",
          value: 70,
          description: "Efforts to build support coalitions",
        },
        {
          name: "Opposition Strategy",
          level: "Proficient",
          value: 75,
          description: "Organized opposition and counter-arguments",
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchBillDetail = async () => {
      if (!billId) {
        setError("No bill ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch bill data
        const { data: billData, error: billError } = await supabase
          .from("Bills")
          .select("*")
          .eq("bill_id", parseInt(billId))
          .single();

        if (billError) throw billError;

        setBill(billData);

        // Fetch history data
        const { data: historyData, error: historyError } = await supabase
          .from("History Table")
          .select("*")
          .eq("bill_id", parseInt(billId))
          .order("sequence", { ascending: true });

        if (historyError) throw historyError;

        setHistoryData(historyData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch bill");
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetail();
  }, [billId]);

  return {
    bill,
    loading,
    error,
    journeyEvents,
    analysisCategories,
  };
};