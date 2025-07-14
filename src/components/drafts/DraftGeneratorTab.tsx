import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const DraftGeneratorTab = () => {
  const [problemStatement, setProblemStatement] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!problemStatement.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCurrentStep(2);
    setIsGenerating(false);
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
              placeholder="Describe the problem you want to address with legislation..."
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
                <h4 className="mb-2">Suggested Approach</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Based on your problem statement, we recommend creating legislation that addresses the core issues through targeted regulatory measures.
                </p>
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