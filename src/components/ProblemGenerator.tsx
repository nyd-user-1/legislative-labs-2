import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, Copy } from "lucide-react";
import { generateProblemFromScenario } from "@/utils/problemStatementHelpers";

interface ProblemGeneratorProps {
  onProblemGenerated?: (problem: string) => void;
}

export const ProblemGenerator = ({ onProblemGenerated }: ProblemGeneratorProps) => {
  const [scenarioInput, setScenarioInput] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const { toast } = useToast();

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
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const generated = await generateProblemFromScenario(scenarioInput);
      setProblemStatement(generated);
      onProblemGenerated?.(generated);

      toast({
        title: "Problem statement generated!",
        description: "Review and copy the statement to use in your legislative idea.",
      });
    } catch (error) {
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
          Problem Statement Generator
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
            className="min-h-[100px] resize-none"
          />
        </div>

        <Button
          onClick={generateProblemStatement}
          disabled={isGeneratingProblem}
          className="w-full"
        >
          {isGeneratingProblem ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Problem Statement...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Problem Statement
            </>
          )}
        </Button>

        {problemStatement && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Problem Statement</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyProblemStatement}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{problemStatement}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};