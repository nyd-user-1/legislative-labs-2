
import { Button } from "@/components/ui/button";
import { ContextBuilder } from "@/utils/contextBuilder";

type Entity = any;
type EntityType = 'bill' | 'member' | 'committee' | 'problem' | null;

interface SuggestedPromptsProps {
  entity: Entity;
  entityType: EntityType;
  onPromptClick: (prompt: string) => void;
  isLoading: boolean;
  showPrompts: boolean;
}

export const SuggestedPrompts = ({ 
  entity, 
  entityType, 
  onPromptClick, 
  isLoading, 
  showPrompts 
}: SuggestedPromptsProps) => {
  if (!showPrompts) return null;

  let prompts: string[] = [];

  if (entityType === 'problem') {
    prompts = [
      "Similar Problems",
      "Fiscal Analysis", 
      "Root Cause",
      "Likely Allies"
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
