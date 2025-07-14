
import { Button } from "@/components/ui/button";
import { ContextBuilder } from "@/utils/contextBuilder";
import { EntityType } from "@/hooks/chat/types";

type Entity = any;

interface SuggestedPromptsProps {
  entity: Entity;
  entityType: EntityType;
  onPromptClick: (prompt: string) => void;
  isLoading: boolean;
  showPrompts: boolean;
  hasMessages: boolean; // Add this to track if there are any messages
}

export const SuggestedPrompts = ({ 
  entity, 
  entityType, 
  onPromptClick, 
  isLoading, 
  showPrompts,
  hasMessages
}: SuggestedPromptsProps) => {
  // Don't show prompts if there are already messages or if showPrompts is false
  if (!showPrompts || hasMessages) return null;

  let prompts: string[] = [];

  if (entityType === 'problem') {
    prompts = [
      "Similar Problems",
      "Fiscal Analysis", 
      "Root Cause",
      "Likely Allies"
    ];
  } else if (entityType === 'solution') {
    prompts = [
      "Implementation Timeline",
      "Stakeholder Analysis",
      "Policy Mechanisms",
      "Success Metrics"
    ];
  } else {
    prompts = ContextBuilder.generateDynamicPrompts(entity, entityType);
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Suggested prompts:</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-3 px-4 text-left whitespace-normal min-w-[160px] max-w-[180px] flex-shrink-0 leading-tight text-sm"
            onClick={() => onPromptClick(prompt)}
            disabled={isLoading}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};
