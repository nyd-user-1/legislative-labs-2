import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProblemGenerator } from "@/components/ProblemGenerator";
import { DraftGenerator } from "@/components/DraftGenerator";
import { DraftEditor } from "@/components/DraftEditor";
import { Sparkles, Lightbulb, FileText } from "lucide-react";

export const DraftGeneratorTab = () => {
  const [currentStep, setCurrentStep] = useState<'problem' | 'idea' | 'draft'>('problem');
  const [problemStatement, setProblemStatement] = useState('');
  const [idea, setIdea] = useState('');

  const handleProblemGenerated = (problem: string) => {
    setProblemStatement(problem);
    setCurrentStep('idea');
  };

  const handleDraftBill = (problem: string) => {
    setProblemStatement(problem);
    setIdea(problem); // Use the problem as the initial idea
    setCurrentStep('draft');
  };

  const handleIdeaChange = (newIdea: string) => {
    setIdea(newIdea);
  };

  const handleDraftGenerated = (draft: string) => {
    // Handle the generated draft
    console.log('Draft generated:', draft);
  };

  const handleProgressChange = (progress: any) => {
    // Handle progress updates
    console.log('Progress:', progress);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Legislative Draft Generator
          </CardTitle>
          <p className="text-gray-600">
            Generate comprehensive legislative drafts using AI assistance. Start with a problem statement, 
            develop your idea, and create a full draft.
          </p>
        </CardHeader>
      </Card>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 py-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          currentStep === 'problem' ? 'bg-blue-100 text-blue-800' : 
          problemStatement ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">1. Problem Statement</span>
        </div>
        
        <div className={`w-8 h-px ${problemStatement ? 'bg-green-300' : 'bg-gray-300'}`} />
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          currentStep === 'idea' ? 'bg-blue-100 text-blue-800' : 
          idea ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">2. Idea Development</span>
        </div>
        
        <div className={`w-8 h-px ${idea ? 'bg-green-300' : 'bg-gray-300'}`} />
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          currentStep === 'draft' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
        }`}>
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">3. Draft Generation</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'problem' && (
        <div className="space-y-6">
          <ProblemGenerator 
            onProblemGenerated={handleProblemGenerated}
            onDraftBill={handleDraftBill}
          />
        </div>
      )}

      {currentStep === 'idea' && (
        <div className="space-y-6">
          <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Develop Your Legislative Idea</CardTitle>
              <p className="text-gray-600">
                Based on your problem statement, develop a comprehensive legislative idea.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Problem Statement</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900">{problemStatement}</p>
                  </div>
                </div>
                
                <DraftGenerator
                  idea={idea}
                  onIdeaChange={handleIdeaChange}
                  onDraftGenerated={handleDraftGenerated}
                  onProgressChange={handleProgressChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'draft' && (
        <div className="space-y-6">
          <DraftEditor
            draft={null}
            onDraftChange={() => {}}
            onProgressChange={handleProgressChange}
          />
        </div>
      )}
    </div>
  );
};