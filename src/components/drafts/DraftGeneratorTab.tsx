
import { ProblemGenerator } from "@/components/ProblemGenerator";

export const DraftGeneratorTab = () => {
  const handleProblemGenerated = (problem: string) => {
    console.log("Problem generated:", problem);
  };

  const handleDraftBill = (problem: string) => {
    console.log("Draft bill for problem:", problem);
  };

  return (
    <div className="space-y-8">
      <ProblemGenerator 
        onProblemGenerated={handleProblemGenerated}
        onDraftBill={handleDraftBill}
      />
    </div>
  );
};
