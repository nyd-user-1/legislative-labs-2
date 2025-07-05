import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pen, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MediaPlanningProps {
  problemStatement: string;
  legislativeIdea: string;
}

export const MediaPlanning = ({ problemStatement, legislativeIdea }: MediaPlanningProps) => {
  const [planningInput, setPlanningInput] = useState("");
  const [mediaContent, setMediaContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateMediaContent = async () => {
    if (!planningInput.trim() && !problemStatement && !legislativeIdea) {
      toast({
        title: "No content to work with",
        description: "Please provide media planning input or complete the legislative process first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const baseContent = `Problem Statement: ${problemStatement}\n\nLegislative Idea: ${legislativeIdea}`;
      const userInput = planningInput.trim() || "Prepare talking points, draft a press release, and draw up a social media post...all at once.";
      
      const prompt = `Based on this legislative content, create comprehensive media materials:

${baseContent}

Media Planning Request: ${userInput}

Please create:
1. Key talking points for interviews and speeches
2. A professional press release
3. Social media posts for different platforms (Twitter, Facebook, LinkedIn)
4. Background briefing materials
5. FAQ responses for common questions

Make it comprehensive but focused, suitable for legislative advocacy and public communication.`;

      const { data, error } = await supabase.functions.invoke('generate-with-openai', {
        body: { prompt, type: 'media' }
      });

      if (error) {
        console.error('Error calling OpenAI function:', error);
        throw new Error('Failed to generate media content');
      }

      const content = data.generatedText || "Media content generation failed. Please try again.";
      setMediaContent(content);

      toast({
        title: "Media content generated!",
        description: "Your media materials are ready for review.",
      });
    } catch (error) {
      console.error('Media generation error:', error);
      toast({
        title: "Error generating media content",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMediaContent = async () => {
    if (!mediaContent) return;
    
    try {
      await navigator.clipboard.writeText(mediaContent);
      toast({
        title: "Copied to clipboard!",
        description: "Media content has been copied.",
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
          <Pen className="h-5 w-5" />
          Media Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="planning">Begin media planning</Label>
          <Textarea
            id="planning"
            placeholder="Prepare talking points, draft a press release, and draw up a social media post...all at once."
            value={planningInput}
            onChange={(e) => setPlanningInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                generateMediaContent();
              }
            }}
            className="textarea-auto resize-none form-input"
          />
        </div>

        <Button
          onClick={generateMediaContent}
          disabled={isGenerating}
          className="button-generate touch-manipulation"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Drawing It Up...
            </>
          ) : (
            <>
              <Pen className="mr-2 h-4 w-4" />
              Draw It Up
            </>
          )}
        </Button>

        {mediaContent && (
          <div className="space-y-2">
            <Label>Generated Media Content</Label>
            <div className="bg-muted/50 p-4 rounded-lg border output-container relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyMediaContent}
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-70 hover:opacity-100 z-10"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <ScrollArea className="h-[400px] w-full pr-10">
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {mediaContent}
                </pre>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};