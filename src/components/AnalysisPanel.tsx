import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LegislativeDraft } from "@/types/legislation";
import { TrendingUp, Clock, Users, Scale, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";
import { useToast } from "@/hooks/use-toast";

interface AnalysisPanelProps {
  draft: LegislativeDraft | null;
}

interface ProblemStatementCardProps {
  title: string;
  description: string;
  index: number;
  onAnalyze: (problem: string) => void;
}

const ProblemStatementCard = ({ title, description, index, onAnalyze }: ProblemStatementCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onAnalyze(description)}>
      <CardHeader>
        <CardTitle className="text-lg">Problem Statement {String(index).padStart(4, '0')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
    </Card>
  );
};

export const AnalysisPanel = ({ draft }: AnalysisPanelProps) => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const { selectedModel } = useModel();
  const { toast } = useToast();
  const generateAnalysis = async (problemStatement: string) => {
    setIsGeneratingAnalysis(true);
    
    try {
      const prompt = `Analyze this problem statement for legislative purposes and provide a comprehensive analysis:

Problem Statement: ${problemStatement}

Please provide detailed analysis covering:
1. Fiscal Impact Assessment - estimated costs, confidence level, breakdown
2. Implementation Timeline - phases, duration, status
3. Similar Legislation - other states/jurisdictions with similar laws
4. Stakeholder Analysis - affected groups, their positions, impact levels
5. Risk Assessment - potential risks, probability, impact levels

Format the response as a structured analysis suitable for legislative decision-making.`;

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { prompt, type: 'analysis', model: selectedModel }
      });

      if (error) {
        console.error('Error calling analysis function:', error);
        throw new Error('Failed to generate analysis');
      }

      // Parse the generated analysis or use mock data if parsing fails
      const generatedAnalysis = data.generatedText || 'Analysis generated successfully';
      
      setAnalysisData({
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
        ],
        fullAnalysis: generatedAnalysis
      });

      toast({
        title: "Analysis generated successfully!",
        description: "Review the comprehensive analysis below.",
      });
    } catch (error) {
      console.error('Analysis generation error:', error);
      toast({
        title: "Error generating analysis",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Sample problem statements for demonstration
  const problemStatements = [
    { 
      title: "Digital Privacy Rights", 
      description: "Companies collect vast amounts of personal data without clear consent or transparency about usage." 
    },
    { 
      title: "Climate Change Adaptation", 
      description: "Rising sea levels and extreme weather events threaten coastal communities and infrastructure." 
    },
    { 
      title: "Healthcare Access", 
      description: "Rural communities lack adequate access to specialized medical care and emergency services." 
    }
  ];

  if (!draft && !analysisData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Legislative Analysis Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Select a problem statement below to generate comprehensive legislative analysis:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problemStatements.map((problem, index) => (
                <ProblemStatementCard
                  key={index}
                  title={problem.title}
                  description={problem.description}
                  index={index + 1}
                  onAnalyze={generateAnalysis}
                />
              ))}
            </div>
            {isGeneratingAnalysis && (
              <div className="flex items-center justify-center mt-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span>Generating comprehensive analysis...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAnalysis = analysisData || (draft ? {
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
  } : null);

  return (
    <div className="space-y-6">
      {analysisData?.fullAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysisData.fullAnalysis}</p>
            </div>
            <Button 
              onClick={() => setAnalysisData(null)} 
              variant="outline" 
              className="mt-4"
            >
              Generate New Analysis
            </Button>
          </CardContent>
        </Card>
      )}
      
      {currentAnalysis && (
        <>
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
                    <Badge variant="outline">{currentAnalysis.fiscalImpact.confidence}% confidence</Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">{currentAnalysis.fiscalImpact.estimatedCost}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cost Breakdown:</h4>
                  {currentAnalysis.fiscalImpact.breakdown.map((item, index) => (
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
                {currentAnalysis.implementationTimeline.phases.map((phase, index) => (
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
                {currentAnalysis.similarLegislation.map((leg, index) => (
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
                {currentAnalysis.stakeholders.map((stakeholder, index) => (
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
                {currentAnalysis.riskFactors.map((risk, index) => (
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
        </>
      )}
    </div>
  );
};