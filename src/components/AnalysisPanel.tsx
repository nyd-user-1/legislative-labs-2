
import { LegislativeDraft } from "@/types/legislation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisPanelProps {
  draft: LegislativeDraft | null;
}

export const AnalysisPanel = ({ draft }: AnalysisPanelProps) => {
  if (!draft) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a draft to view analysis</p>
        </CardContent>
      </Card>
    );
  }

  // Default analysis data for when a draft is selected
  const analysisData = {
    fiscalImpact: {
      estimatedCost: "$2.5M - $5.2M annually",
      confidence: 75,
      breakdown: [
        "Administrative costs: $1.2M",
        "Implementation costs: $800K",
        "Ongoing operations: $1.5M"
      ]
    },
    implementationTimeline: {
      phases: [
        { name: "Regulatory Development", duration: "6 months", status: "pending" },
        { name: "Agency Training", duration: "3 months", status: "pending" },
        { name: "Public Outreach", duration: "4 months", status: "pending" },
        { name: "Full Implementation", duration: "12 months", status: "pending" }
      ]
    },
    similarLegislation: [
      { state: "California", bill: "AB 123", similarity: 85, status: "Enacted" },
      { state: "New York", bill: "S 456", similarity: 72, status: "Pending" },
      { state: "Texas", bill: "HB 789", similarity: 68, status: "Failed" }
    ],
    stakeholders: [
      { group: "Industry Associations", impact: "High", position: "Opposed" },
      { group: "Consumer Groups", impact: "High", position: "Supportive" },
      { group: "Government Agencies", impact: "Medium", position: "Neutral" },
      { group: "Legal Community", impact: "Medium", position: "Mixed" }
    ],
    riskFactors: [
      { risk: "Constitutional Challenge", probability: "Medium", impact: "High" },
      { risk: "Implementation Delays", probability: "High", impact: "Medium" },
      { risk: "Industry Pushback", probability: "High", impact: "Medium" }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Fiscal Impact</h3>
            <p className="text-sm text-muted-foreground">{analysisData.fiscalImpact.estimatedCost}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Implementation Timeline</h3>
            <div className="space-y-1">
              {analysisData.implementationTimeline.phases.map((phase, index) => (
                <div key={index} className="text-sm">
                  {phase.name}: {phase.duration}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Similar Legislation</h3>
            <div className="space-y-1">
              {analysisData.similarLegislation.map((item, index) => (
                <div key={index} className="text-sm">
                  {item.state} {item.bill} - {item.status}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
