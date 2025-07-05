import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DraftEditor } from "./DraftEditor";
import { AnalysisPanel } from "./AnalysisPanel";
import { ExportPanel } from "./ExportPanel";
import { DraftSidebar } from "./DraftSidebar";
import { ProgressIndicator } from "./ProgressIndicator";
import { PublicGallery } from "./PublicGallery";
import { UserMenu } from "./UserMenu";
import { LegislativeDraft, DraftProgress } from "@/types/legislation";

const LegislationGenerator = () => {
  const [currentDraft, setCurrentDraft] = useState<LegislativeDraft | null>(null);
  const [progress, setProgress] = useState<DraftProgress>({
    currentStep: 1,
    totalSteps: 4,
    stepNames: ["Idea Input", "Analysis", "Draft Generation", "Review & Export"]
  });
  const [activeTab, setActiveTab] = useState("draft");
  const [saveTrigger, setSaveTrigger] = useState(0);

  const handleSaveDraft = () => {
    setSaveTrigger(prev => prev + 1);
  };

  return (
    <div className="page-container min-h-screen bg-gray-50 p-6">
      <div className="content-wrapper max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-6">
          <ProgressIndicator progress={progress} />
        </div>

        {/* Collapsible Sidebar */}
        <DraftSidebar 
          currentDraft={currentDraft}
          onDraftSelect={setCurrentDraft}
          onSaveDraft={handleSaveDraft}
        />
        
        {/* Main Content */}
        <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="gallery">Public Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draft" className="mt-0">
            <DraftEditor 
              draft={currentDraft}
              onDraftChange={setCurrentDraft}
              onProgressChange={setProgress}
              saveTrigger={saveTrigger}
            />
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-0">
            <AnalysisPanel draft={currentDraft} />
          </TabsContent>
          
          <TabsContent value="export" className="mt-0">
            <ExportPanel draft={currentDraft} />
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-0">
            <PublicGallery onDraftSelect={setCurrentDraft} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LegislationGenerator;