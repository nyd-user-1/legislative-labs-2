import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProblemSolverSection } from "@/components/ProblemSolverSection";
import { PublicGalleryTab } from "@/components/drafts/PublicGalleryTab";

const LegislativeDrafts = () => {
  const [generatedProblem, setGeneratedProblem] = useState<string>("");
  const [showOutput, setShowOutput] = useState(false);

  const handleProblemGenerated = (problem: string) => {
    setGeneratedProblem(problem);
    setShowOutput(true);
  };

  const handleSave = () => {
    console.log("Saving problem:", generatedProblem);
    // TODO: Implement save functionality
  };

  const handleSaveAndSubmit = () => {
    console.log("Saving and submitting problem:", generatedProblem);
    // TODO: Implement save and submit to public gallery
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Problem</h1>
          <p className="text-gray-600 mt-2">
            It's not a complaint. It's a problem.
          </p>
        </div>

        {/* Problem Solver Section */}
        <div className="mb-8">
          <ProblemSolverSection 
            onProblemGenerated={handleProblemGenerated}
            onDraftBill={() => {}}
          />
        </div>

        {/* Output Area */}
        {showOutput && (
          <div className="mb-8">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Generated Problem Statement</h3>
              </div>
              <ScrollArea className="h-64 p-4">
                <div className="text-gray-700 whitespace-pre-wrap">
                  {generatedProblem}
                </div>
              </ScrollArea>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={handleSave}
                className="bg-white hover:bg-gray-50"
              >
                Save
              </Button>
              <Button 
                onClick={handleSaveAndSubmit}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Save & Submit
              </Button>
            </div>
          </div>
        )}

        {/* Public Gallery Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Public Problem Gallery</h2>
            <p className="text-gray-600 mt-2">
              Explore problems shared by the community
            </p>
          </div>
          <PublicGalleryTab />
        </div>
      </div>
    </div>
  );
};

export default LegislativeDrafts;