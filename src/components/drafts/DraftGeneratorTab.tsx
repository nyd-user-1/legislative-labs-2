
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AIChatSheet } from "../AIChatSheet";
import { ProblemChatsGrid } from "./ProblemChatsGrid";

export const DraftGeneratorTab = () => {
  const [problemStatement, setProblemStatement] = useState("");
  const [chatSheetOpen, setChatSheetOpen] = useState(false);

  const handleGenerate = async () => {
    if (!problemStatement.trim()) return;
    
    // Open the AI Chat Sheet - let it handle the session creation
    setChatSheetOpen(true);
  };

  // Create a problem object to pass to the chat sheet
  const problemObject = {
    id: "draft-problem",
    title: "Problem Statement",
    description: problemStatement,
    originalStatement: problemStatement
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
              disabled={!problemStatement.trim()}
              className="w-full sm:w-auto"
            >
              Generate Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Problem Chats Grid Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Trust The Process</h2>
          <p className="text-gray-600">
            You have identified the problem. That's the first step in solving the problem. Keep going!
          </p>
        </div>
        <ProblemChatsGrid />
      </div>

      {/* AI Chat Sheet for Problem Analysis */}
      <AIChatSheet
        open={chatSheetOpen}
        onOpenChange={setChatSheetOpen}
        problem={problemObject}
      />
    </div>
  );
};
