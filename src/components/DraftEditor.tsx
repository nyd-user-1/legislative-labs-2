import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LegislativeDraft, DraftProgress } from "@/types/legislation";
import { detectLegislativeCategory, extractTitleFromIdea } from "@/utils/legislativeHelpers";
import { ProblemGenerator } from "./ProblemGenerator";
import { DraftGenerator } from "./DraftGenerator";
import { DraftDisplay } from "./DraftDisplay";

interface DraftEditorProps {
  draft: LegislativeDraft | null;
  onDraftChange: (draft: LegislativeDraft) => void;
  onProgressChange: (progress: DraftProgress) => void;
  saveTrigger?: number;
}

export const DraftEditor = ({ draft, onDraftChange, onProgressChange, saveTrigger }: DraftEditorProps) => {
  const [idea, setIdea] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (draft) {
      setIdea(draft.originalIdea);
      setDraftContent(draft.draftContent);
    }
  }, [draft]);

  useEffect(() => {
    if (saveTrigger && saveTrigger > 0) {
      saveDraft();
    }
  }, [saveTrigger]);

  const saveDraft = () => {
    const detectedCategory = detectLegislativeCategory(idea);
    const newDraft: LegislativeDraft = {
      id: draft?.id || crypto.randomUUID(),
      title: extractTitleFromIdea(idea) || "Untitled Draft",
      type: detectedCategory,
      originalIdea: idea,
      improvedIdea: "",
      draftContent,
      analysis: {
        fiscalImpact: "Analysis pending",
        implementationTimeline: "Timeline pending",
        similarLegislation: [],
        stakeholders: []
      },
      votes: draft?.votes || {
        rating: 0,
        totalVotes: 0,
        starCounts: [0, 0, 0, 0, 0]
      },
      isPublic: true,
      createdAt: draft?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onDraftChange(newDraft);
    
    // Save to localStorage
    const existingDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    const updatedDrafts = draft 
      ? existingDrafts.map((d: LegislativeDraft) => d.id === draft.id ? newDraft : d)
      : [...existingDrafts, newDraft];
    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));

    toast({
      title: "Draft saved!",
      description: "Your work has been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <ProblemGenerator onProblemGenerated={() => {}} />
      
      <DraftGenerator
        idea={idea}
        onIdeaChange={setIdea}
        onDraftGenerated={setDraftContent}
        onProgressChange={onProgressChange}
      />

      <DraftDisplay draftContent={draftContent} />
    </div>
  );
};