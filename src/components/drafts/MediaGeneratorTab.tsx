
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AIChatSheet } from "../AIChatSheet";
import { SolutionChatsGrid } from "./SolutionChatsGrid";

export const MediaGeneratorTab = () => {
  const [mediaStatement, setMediaStatement] = useState("");
  const [chatSheetOpen, setChatSheetOpen] = useState(false);

  const handleGenerate = async () => {
    if (!mediaStatement.trim()) return;
    
    // Open the AI Chat Sheet - let it handle the session creation
    setChatSheetOpen(true);
    
    // Clear the media statement input after generating media kit
    setMediaStatement("");
  };

  // Create a media object to pass to the chat sheet
  const mediaObject = {
    id: "draft-media",
    title: "Media Kit Statement",
    description: mediaStatement,
    originalStatement: mediaStatement
  };

  return (
    <div className="space-y-8">
      {/* Media Kit Statement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm">
              3
            </span>
            Generate Talking Points and Media Kit
          </CardTitle>
          <CardDescription>
            Transform your policy solutions into compelling talking points, press releases, and media materials that effectively communicate your legislative proposals to stakeholders and the public.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Based on your solution analysis, describe the key messages and talking points you want to develop for media outreach..."
              value={mediaStatement}
              onChange={(e) => setMediaStatement(e.target.value)}
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleGenerate}
              disabled={!mediaStatement.trim()}
              className="w-full sm:w-auto"
            >
              Generate Media Kit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Solution Chats Grid Section - showing existing solutions to create media kits for */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Available Solutions for Media Kit Generation</h2>
          <p className="text-gray-600">
            Select a solution from your existing solution statements to develop talking points and media materials.
          </p>
        </div>
        <SolutionChatsGrid />
      </div>

      {/* AI Chat Sheet for Media Kit Generation */}
      <AIChatSheet
        open={chatSheetOpen}
        onOpenChange={setChatSheetOpen}
        solution={mediaObject}
      />
    </div>
  );
};
