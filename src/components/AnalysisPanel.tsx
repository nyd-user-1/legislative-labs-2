import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LegislativeDraft } from "@/types/legislation";
import { TrendingUp, Clock, Users, Scale, AlertTriangle, Loader2 } from "lucide-react";
import { generateAnalysis, AnalysisData } from "@/utils/analysisHelpers";
import { useToast } from "@/hooks/use-toast";

interface AnalysisPanelProps {
  draft: LegislativeDraft | null;
}

export const AnalysisPanel = ({ draft }: AnalysisPanelProps) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  if (!draft) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Select or create a draft to view analysis</p>
        </CardContent>
      </Card>
    );
  }

  const handleGenerateAnalysis = async () => {
    if (!draft.draftContent || !draft.title) {
      toast({
        title: "Error",
        description: "Draft content is required for analysis",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analysisData = await generateAnalysis(draft.draftContent, draft.title);
      setAnalysis(analysisData);
      toast({
        title: "Analysis Generated",
        description: "Legislative analysis has been generated successfully"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate analysis';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis && !isLoading && !error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <Scale className="h-16 w-16 opacity-50" />
          <h3 className="text-lg font-medium">No Analysis Generated</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Generate a comprehensive analysis of this legislative draft including fiscal impact, timeline, and risk assessment.
          </p>
          <Button onClick={handleGenerateAnalysis} className="mt-4">
            Generate Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Generating analysis...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <AlertTriangle className="h-16 w-16 text-destructive opacity-50" />
          <h3 className="text-lg font-medium">Analysis Failed</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
          <Button onClick={handleGenerateAnalysis} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Legislative Analysis</h2>
        <Button onClick={handleGenerateAnalysis} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
        </Button>
      </div>

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
                <Badge variant="outline">{analysis.fiscalImpact.confidence}% confidence</Badge>
              </div>
              <p className="text-2xl font-bold text-primary">{analysis.fiscalImpact.estimatedCost}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Cost Breakdown:</h4>
              {analysis.fiscalImpact.breakdown.map((item, index) => (
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
            {analysis.implementationTimeline.phases.map((phase, index) => (
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
            {analysis.similarLegislation.map((leg, index) => (
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
            {analysis.stakeholders.map((stakeholder, index) => (
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
            {analysis.riskFactors.map((risk, index) => (
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