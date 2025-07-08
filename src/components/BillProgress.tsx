interface BillProgressProps {
  status: number | null;
}

export const BillProgress = ({ status }: BillProgressProps) => {
  const steps = [
    { id: 1, label: "Introduced" },
    { id: 2, label: "In Committee" },
    { id: 3, label: "Passed Chamber" },
    { id: 4, label: "Signed into Law" },
  ];

  const getCurrentStep = (status: number | null) => {
    if (!status) return 1;
    if (status === 5) return 2; // Failed bills stay at committee
    return Math.min(Math.max(status, 1), 4);
  };

  const currentStep = getCurrentStep(status);
  const isFailed = status === 5;

  const getStepStatus = (stepId: number) => {
    if (isFailed && stepId > 2) return "inactive";
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "inactive";
  };

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return "bg-primary text-primary-foreground";
      case "current":
        return "bg-primary text-primary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getConnectorColor = (fromStep: number) => {
    const fromStatus = getStepStatus(fromStep);
    const toStatus = getStepStatus(fromStep + 1);
    
    if (fromStatus === "completed" && (toStatus === "completed" || toStatus === "current")) {
      return "bg-primary";
    }
    return "bg-muted";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getStepColor(stepStatus)}`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-xs text-center max-w-16">
                  <div className="font-medium">{step.label}</div>
                </div>
              </div>
              
              {!isLast && (
                <div className="flex-1 mx-2">
                  <div 
                    className={`h-0.5 ${getConnectorColor(step.id)}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">Bill Failed</p>
          <p className="text-xs text-destructive/80 mt-1">This bill did not advance beyond the committee stage.</p>
        </div>
      )}
    </div>
  );
};