import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { FileText, Users, Building2, CheckCircle, Target, Scale, TrendingUp } from "lucide-react";

interface BillWithSponsor extends Tables<"Bills"> {
  sponsor_name?: string;
  sponsor_id?: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const journeyEvents: JourneyEvent[] = [
    {
      id: 1,
      date: "2024",
      title: "Bill Introduced",
      subtitle: "Senate Floor",
      description: "Bill formally introduced in the New York State Legislature with initial sponsor assignment",
      icon: <FileText className="h-4 w-4 text-white" />,
      status: "completed",
    },
    {
      id: 2,
      date: "2024",
      title: "Committee Assignment",
      subtitle: bill?.committee || "Committee Review",
      description: "Bill assigned to appropriate legislative committee for detailed review and stakeholder input",
      icon: <Building2 className="h-4 w-4 text-white" />,
      status: "completed",
    },
    {
      id: 3,
      date: "2024",
      title: "Committee Hearings",
      subtitle: "In Progress",
      description: "Committee conducting public hearings and expert testimony on bill provisions",
      icon: <Users className="h-4 w-4 text-white" />,
      status: "current",
    },
    {
      id: 4,
      date: "TBD",
      title: "Floor Vote",
      subtitle: "Pending",
      description: "Full chamber consideration and voting on final bill passage",
      icon: <CheckCircle className="h-4 w-4 text-white" />,
      status: "pending",
    },
  ];

  const analysisCategories: AnalysisCategory[] = [
    {
      id: "impact",
      name: "Impact",
      icon: <Target className="h-5 w-5 text-blue-500" />,
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
      id: "history",
      name: "History",
      icon: <Scale className="h-5 w-5 text-purple-500" />,
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
      id: "politics",
      name: "Politics",
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
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
        const { data, error } = await supabase
          .from("Bills")
          .select("*")
          .eq("bill_id", parseInt(billId))
          .single();

        if (error) throw error;

        setBill(data);
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