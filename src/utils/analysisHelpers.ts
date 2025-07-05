import { supabase } from '@/integrations/supabase/client';

export interface AnalysisData {
  fiscalImpact: {
    estimatedCost: string;
    confidence: number;
    breakdown: string[];
  };
  implementationTimeline: {
    phases: Array<{
      name: string;
      duration: string;
      status: string;
    }>;
  };
  similarLegislation: Array<{
    state: string;
    bill: string;
    similarity: number;
    status: string;
  }>;
  stakeholders: Array<{
    group: string;
    impact: string;
    position: string;
  }>;
  riskFactors: Array<{
    risk: string;
    probability: string;
    impact: string;
  }>;
}

export const generateAnalysis = async (draftContent: string, title: string): Promise<AnalysisData> => {
  try {
    const prompt = `Analyze this legislative draft and provide a comprehensive analysis in the following JSON format:

{
  "fiscalImpact": {
    "estimatedCost": "cost range (e.g., '$2.5M - $5.2M annually')",
    "confidence": confidence_percentage_number,
    "breakdown": ["Administrative costs: $X", "Implementation costs: $X", "Ongoing operations: $X"]
  },
  "implementationTimeline": {
    "phases": [
      {"name": "Phase Name", "duration": "X months", "status": "pending"},
      {"name": "Phase Name", "duration": "X months", "status": "pending"}
    ]
  },
  "similarLegislation": [
    {"state": "State Name", "bill": "Bill Number", "similarity": percentage_number, "status": "Enacted|Pending|Failed"}
  ],
  "stakeholders": [
    {"group": "Group Name", "impact": "High|Medium|Low", "position": "Supportive|Opposed|Neutral|Mixed"}
  ],
  "riskFactors": [
    {"risk": "Risk Description", "probability": "High|Medium|Low", "impact": "High|Medium|Low"}
  ]
}

Legislative Draft:
Title: ${title}

Content: ${draftContent}

Provide realistic and specific analysis based on the content. Return only valid JSON.`;

    const { data, error } = await supabase.functions.invoke('generate-with-openai', {
      body: { prompt, type: 'analysis' }
    });

    if (error) {
      console.error('Error calling OpenAI function:', error);
      throw new Error('Failed to generate analysis');
    }

    try {
      const analysisData = JSON.parse(data.generatedText);
      return analysisData;
    } catch (parseError) {
      console.error('Error parsing analysis JSON:', parseError);
      throw new Error('Failed to parse analysis data');
    }
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw new Error('Failed to generate analysis. Please check your connection and try again.');
  }
};