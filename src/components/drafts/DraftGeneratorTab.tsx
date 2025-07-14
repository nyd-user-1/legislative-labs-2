import { ProblemGenerator } from "@/components/ProblemGenerator";
import { ProblemSolverSection } from "@/components/ProblemSolverSection";

export const DraftGeneratorTab = () => {
  const handleProblemGenerated = (problem: string) => {
    console.log("Problem generated:", problem);
  };

  const handleDraftBill = (problem: string) => {
    console.log("Draft bill for problem:", problem);
  };

  return (
    <div className="space-y-8">
      {/* Existing Problem Generator */}
      <ProblemGenerator 
        onProblemGenerated={handleProblemGenerated}
        onDraftBill={handleDraftBill}
      />
      
      {/* New Problem Solver Section showing saved problem statements */}
      <ProblemSolverSection 
        onProblemGenerated={handleProblemGenerated}
        onDraftBill={handleDraftBill}
      />
    </div>
  );
};
