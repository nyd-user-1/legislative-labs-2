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
import ReactMarkdown from "react-markdown";

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
    <div className="space-y-6">
      {/* Problem Statement Section */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            Problem Statement
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Based on your problem statement, develop a comprehensive legislative idea.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem Statement Display */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Problem Statement</Label>
            <div className="bg-gray-900 text-white p-6 rounded-lg min-h-[200px] relative">
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>
                  {problemStatement || "**Problem Statement:** The escalating cost of higher education in the United States has resulted in a significant increase in student loan debt, with over 45 million borrowers collectively owing more than $1.7 trillion. This debt burden is disproportionately affecting low- and middle-income families, leading to long-term financial instability, delayed homeownership, and reduced economic mobility for graduates. The current reliance on student loans as a primary means of financing higher education is creating a cycle of debt that impacts not only individual borrowers but also the broader economy, which suffers from decreased consumer spending and increased reliance on social services. Existing federal and state regulations have proven insufficient in addressing the root causes of the student debt crisis. Current legislation primarily focuses on loan availability and repayment plans, rather than tackling the underlying issues of rising tuition costs and inadequate institutional accountability. Furthermore, the complexities of existing student loan programs create barriers for borrowers seeking relief, leaving many without adequate options to manage or reduce their debt. There is a pressing need for comprehensive legislative action that addresses both the affordability of higher education and the mechanisms of student loan financing to ensure equitable access to education without the crippling burden of debt. Such reforms would not only alleviate the financial strain on families but also foster a more sustainable and equitable economic environment."}
                </ReactMarkdown>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyProblemStatement}
                className="absolute bottom-4 right-4 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ideation Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Ideation</Label>
            <Textarea
              placeholder="Enter your idea for legislation or policy here. Be as detailed as possible and include a problem statement."
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  generateProblemStatement();
                }
              }}
              className="min-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Button
            onClick={generateProblemStatement}
            disabled={isGeneratingProblem}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isGeneratingProblem ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};