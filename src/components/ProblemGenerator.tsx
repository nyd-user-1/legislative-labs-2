import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, Copy, FileText, Target } from "lucide-react";
import { generateProblemFromScenario } from "@/utils/problemStatementHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useModel } from "@/contexts/ModelContext";

interface ProblemGeneratorProps {
  onProblemGenerated?: (problem: string) => void;
  onDraftBill?: (problem: string) => void;
}

export const ProblemGenerator = ({ onProblemGenerated, onDraftBill }: ProblemGeneratorProps) => {
  const [scenarioInput, setScenarioInput] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const { toast } = useToast();
  const { selectedModel } = useModel();

  const generateProblemStatement = async () => {
    if (!scenarioInput.trim()) {
      toast({
        title: "Please enter a scenario",
        description: "Describe a real-life scenario to generate a problem statement",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingProblem(true);
    setProblemStatement("");
    
    try {
      const prompt = `Based on this real-life scenario, generate a clear, structured problem statement that identifies issues requiring legislative action. Focus on the problem, its impact, and why legislation is needed:

Scenario: ${scenarioInput}

Please create a comprehensive problem statement that:
1. Clearly defines the problem
2. Explains the impact on society/individuals
3. Identifies why current solutions are inadequate
4. Justifies the need for legislative intervention
5. Suggests the scope of legislative action needed

Format it as a professional problem statement suitable for legislative drafting.`;

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { prompt, type: 'problem', model: selectedModel, stream: true }
      });

      if (error) {
        console.error('Error calling OpenAI function:', error);
        throw new Error('Failed to generate problem statement');
      }

      // For now, handle non-streaming response
      const generated = data.generatedText || await generateProblemFromScenario(scenarioInput);
      setProblemStatement(generated);
      onProblemGenerated?.(generated);

      toast({
        title: "Problem statement generated!",
        description: "Review and copy the statement to use in your legislative idea.",
      });
    } catch (error) {
      console.error('Problem generation error:', error);
      toast({
        title: "Error generating problem statement",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const copyProblemStatement = async () => {
    if (!problemStatement) return;
    
    try {
      await navigator.clipboard.writeText(problemStatement);
      toast({
        title: "Copied to clipboard!",
        description: "Problem statement has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Problem Statement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scenario">Describe a Real-Life Scenario</Label>
          <Textarea
            id="scenario"
            placeholder="Describe a real-life situation or scenario that illustrates the problem you want to address with legislation..."
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                generateProblemStatement();
              }
            }}
            className="min-h-[100px] resize-none form-input"
          />
        </div>

        <Button
          onClick={generateProblemStatement}
          disabled={isGeneratingProblem}
          className="button-generate touch-manipulation"
        >
          {isGeneratingProblem ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>

        {problemStatement && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Generated Problem Statement</Label>
              <div className="bg-muted/50 p-4 rounded-lg border output-container relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyProblemStatement}
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-70 hover:opacity-100"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <p className="text-sm leading-relaxed whitespace-pre-wrap pr-10">{problemStatement}</p>
              </div>
            </div>
            
            <Button
              onClick={() => onDraftBill?.(problemStatement)}
              variant="secondary"
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Draft Bill from Problem Statement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};