export interface LegislativeDraft {
  id: string;
  title: string;
  type: 'Bill' | 'Resolution' | 'Amendment';
  originalIdea: string;
  improvedIdea: string;
  draftContent: string;
  analysis: {
    fiscalImpact: string;
    implementationTimeline: string;
    similarLegislation: string[];
    stakeholders: string[];
  };
  votes: {
    support: number;
    oppose: number;
    neutral: number;
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftProgress {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}