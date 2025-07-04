import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LegislativeDraft } from "@/types/legislation";
import { TrendingUp, Clock, Users, Scale, AlertTriangle } from "lucide-react";

interface AnalysisPanelProps {
  draft: LegislativeDraft | null;
}

export const AnalysisPanel = ({ draft }: AnalysisPanelProps) => {
  if (!draft) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Select or create a draft to view analysis</p>
        </CardContent>
      </Card>
    );
  }

  const mockAnalysis = {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fiscal Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fiscal Impact Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Cost Estimate</span>
                <Badge variant="outline">{mockAnalysis.fiscalImpact.confidence}% confidence</Badge>
              </div>
              <p className="text-2xl font-bold text-primary">{mockAnalysis.fiscalImpact.estimatedCost}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Cost Breakdown:</h4>
              {mockAnalysis.fiscalImpact.breakdown.map((item, index) => (
                <p key={index} className="text-sm text-muted-foreground">• {item}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Implementation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalysis.implementationTimeline.phases.map((phase, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{phase.name}</span>
                  <Badge variant="secondary">{phase.duration}</Badge>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Similar Legislation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Similar Legislation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalysis.similarLegislation.map((leg, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{leg.state} - {leg.bill}</p>
                  <p className="text-sm text-muted-foreground">{leg.similarity}% similarity</p>
                </div>
                <Badge variant={leg.status === 'Enacted' ? 'default' : leg.status === 'Pending' ? 'secondary' : 'destructive'}>
                  {leg.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Stakeholder Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalysis.stakeholders.map((stakeholder, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{stakeholder.group}</p>
                  <p className="text-sm text-muted-foreground">Impact: {stakeholder.impact}</p>
                </div>
                <Badge variant={
                  stakeholder.position === 'Supportive' ? 'default' : 
                  stakeholder.position === 'Opposed' ? 'destructive' : 'secondary'
                }>
                  {stakeholder.position}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalysis.riskFactors.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{risk.risk}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Probability: {risk.probability}</span>
                    <span>Impact: {risk.impact}</span>
                  </div>
                </div>
                <Badge variant="outline">
                  {risk.probability === 'High' ? '🔴' : risk.probability === 'Medium' ? '🟡' : '🟢'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};