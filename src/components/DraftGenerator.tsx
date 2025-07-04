import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, FileText } from "lucide-react";
import { DraftProgress } from "@/types/legislation";
import { detectLegislativeCategory, generateLegislativeDraft } from "@/utils/legislativeHelpers";

interface DraftGeneratorProps {
  idea: string;
  onIdeaChange: (idea: string) => void;
  onDraftGenerated: (draft: string) => void;
  onProgressChange: (progress: DraftProgress) => void;
}

export const DraftGenerator = ({ idea, onIdeaChange, onDraftGenerated, onProgressChange }: DraftGeneratorProps) => {
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const { toast } = useToast();

  const generateDraft = async () => {
    if (!idea.trim()) {
      toast({
        title: "Please enter an idea first",
        description: "You need to provide an idea before generating a draft",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDraft(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Automatically detect the legislative category from the content
      const detectedCategory = detectLegislativeCategory(idea);
      const draft = generateLegislativeDraft(idea, detectedCategory);
      onDraftGenerated(draft);
      
      onProgressChange({
        currentStep: 3,
        totalSteps: 4,
        stepNames: ["Idea Input", "Analysis", "Draft Generation", "Review & Export"]
      });

      toast({
        title: "Draft generated successfully!",
        description: "Your legislative draft is ready for review.",
      });
    } catch (error) {
      toast({
        title: "Error generating draft",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Legislative Ideation Inputs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="idea">Your Legislative Idea (What problem do you want to solve?)</Label>
          <Textarea
            id="idea"
            placeholder="Enter your idea for legislation or policy here. Be as detailed as possible and include a problem statement."
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <Button
          onClick={generateDraft}
          disabled={isGeneratingDraft}
          className="w-full"
        >
          {isGeneratingDraft ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Draft
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};