
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AIChatSheet } from "../AIChatSheet";
import { SolutionChatsGrid } from "./SolutionChatsGrid";
import { supabase } from "@/integrations/supabase/client";

export const SolutionGeneratorTab = () => {
  const [solutionStatement, setSolutionStatement] = useState("");
  const [chatSheetOpen, setChatSheetOpen] = useState(false);

  const handleGenerate = async () => {
    if (!solutionStatement.trim()) return;
    
    // Open the AI Chat Sheet - let it handle the session creation
    setChatSheetOpen(true);
    
    // Clear the solution statement input after generating solution
    setSolutionStatement("");
  };

  // Create a solution object to pass to the chat sheet
  const solutionObject = {
    id: "draft-solution",
    title: "Solution Statement",
    description: solutionStatement,
    originalStatement: solutionStatement
  };

  return (
    <div className="space-y-8">
      {/* Solution Statement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm">
              2
            </span>
            Potential Solutions
          </CardTitle>
          <CardDescription>
            Let's assess your refined problem statement and develop a real-life policy proposal that directly addresses the problem you have identified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Based on your problem analysis, describe potential policy solutions..."
              value={solutionStatement}
              onChange={(e) => setSolutionStatement(e.target.value)}
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleGenerate}
              disabled={!solutionStatement.trim()}
              className="w-full sm:w-auto"
            >
              Generate Solution
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Solution Chats Grid Section - showing existing solutions */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Solution Statements</h2>
          <p className="text-gray-600">
            Review and manage your generated solution statements. Click the Media Kit button to create talking points and media materials.
          </p>
        </div>
        <SolutionChatsGrid />
      </div>

      {/* AI Chat Sheet for Solution Generation */}
      <AIChatSheet
        open={chatSheetOpen}
        onOpenChange={setChatSheetOpen}
        solution={solutionObject}
      />
    </div>
  );
};
