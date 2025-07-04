import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DraftProgress } from "@/types/legislation";
import { CheckCircle, Circle } from "lucide-react";

interface ProgressIndicatorProps {
  progress: DraftProgress;
}

export const ProgressIndicator = ({ progress }: ProgressIndicatorProps) => {
  const progressPercentage = (progress.currentStep / progress.totalSteps) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden lg:flex items-center gap-2">
        {progress.stepNames.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < progress.currentStep;
          const isCurrent = stepNumber === progress.currentStep;
          
          return (
            <div key={stepNumber} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
                <span className={`text-xs ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                  {step}
                </span>
              </div>
              {index < progress.stepNames.length - 1 && (
                <div className="w-8 h-0.5 bg-muted" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-2">
        <Progress value={progressPercentage} className="w-16 sm:w-24" />
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {progress.currentStep}/{progress.totalSteps}
        </Badge>
      </div>
    </div>
  );
};