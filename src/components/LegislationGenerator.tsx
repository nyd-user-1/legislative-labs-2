import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftEditor } from "./DraftEditor";
import { AnalysisPanel } from "./AnalysisPanel";
import { ExportPanel } from "./ExportPanel";
import { DraftSidebar } from "./DraftSidebar";
import { ProgressIndicator } from "./ProgressIndicator";
import { LegislativeDraft, DraftProgress } from "@/types/legislation";

const LegislationGenerator = () => {
  const [currentDraft, setCurrentDraft] = useState<LegislativeDraft | null>(null);
  const [progress, setProgress] = useState<DraftProgress>({
    currentStep: 1,
    totalSteps: 4,
    stepNames: ["Idea Input", "Analysis", "Draft Generation", "Review & Export"]
  });
  const [activeTab, setActiveTab] = useState("draft");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex flex-col min-w-0 mr-4">
            <h1 className="text-lg sm:text-xl font-bold truncate">AI Legislation Generator</h1>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">Professional legislative drafting platform</p>
          </div>
          <div className="flex-shrink-0">
            <ProgressIndicator progress={progress} />
          </div>
        </div>
      </header>

      {/* Collapsible Sidebar */}
      <DraftSidebar 
        currentDraft={currentDraft}
        onDraftSelect={setCurrentDraft}
      />
      
      {/* Main Content */}
      <main className="container px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draft" className="mt-0">
            <DraftEditor 
              draft={currentDraft}
              onDraftChange={setCurrentDraft}
              onProgressChange={setProgress}
            />
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-0">
            <AnalysisPanel draft={currentDraft} />
          </TabsContent>
          
          <TabsContent value="export" className="mt-0">
            <ExportPanel draft={currentDraft} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LegislationGenerator;