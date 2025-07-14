import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DraftGeneratorTab = () => {
  const [problemStatement, setProblemStatement] = useState("");
  const [refinedProblemStatement, setRefinedProblemStatement] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!problemStatement.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const prompt = `Please refine this problem statement into a clear, structured legislative problem statement. Transform the casual description into professional policy language while maintaining the core issues:

"${problemStatement}"

Please provide a refined problem statement that:
1. Clearly identifies the core issue
2. Explains the impact on affected parties
3. Describes why current laws/regulations may be insufficient
4. Justifies the need for legislative action
5. Is written in professional policy language

Keep it concise but comprehensive (2-3 paragraphs maximum).`;

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { prompt, type: 'problem-refinement' }
      });

      if (error) {
        console.error('Error calling OpenAI function:', error);
        toast.error('Failed to generate refined problem statement. Please try again.');
        return;
      }

      setRefinedProblemStatement(data.generatedText || 'Unable to generate refined problem statement. Please try again.');
      setCurrentStep(2);
      toast.success('Problem statement refined successfully!');
      
    } catch (error) {
      console.error('Error generating refined problem statement:', error);
      toast.error('Failed to generate refined problem statement. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Problem Statement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm">
              1
            </span>
            Problem Statement
          </CardTitle>
          <CardDescription>
            Describe a real-life situation or scenario that illustrates the problem you want to address with legislation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the problem as you would to a friend."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleGenerate}
              disabled={!problemStatement.trim() || isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Idea Development Section (shown after step 1) */}
      {currentStep >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm">
                2
              </span>
              Idea Development
            </CardTitle>
            <CardDescription>
              Based on your problem statement, here are some potential legislative approaches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="mb-2 font-semibold">Refined Problem Statement</h4>
                <div className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">
                  {refinedProblemStatement}
                </div>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                >
                  Proceed to Draft Generation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Generation Section (shown after step 2) */}
      {currentStep >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm">
                3
              </span>
              Draft Generation
            </CardTitle>
            <CardDescription>
              Your legislative draft has been generated based on your inputs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="mb-2">Generated Legislative Draft</h4>
              <p className="text-sm text-gray-700">
                A comprehensive legislative draft addressing your specified problem statement has been created. 
                This includes sections for purpose, definitions, requirements, enforcement, and implementation timeline.
              </p>
              <div className="flex gap-2 mt-4">
                <Button>Save Draft</Button>
                <Button variant="outline">Export PDF</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};