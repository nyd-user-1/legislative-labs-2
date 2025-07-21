
import { Button } from "@/components/ui/button";
import { ContextBuilder } from "@/utils/contextBuilder";
import { EntityType } from "@/hooks/chat/types";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";

type Entity = any;

interface SuggestedPromptsProps {
  entity: Entity;
  entityType: EntityType;
  onPromptClick: (prompt: string) => void;
  isLoading: boolean;
  showPrompts: boolean;
  hasMessages: boolean;
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

  const prompts = ContextBuilder.generateDynamicPrompts(entity, entityType);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Suggested prompts:</h4>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-4 text-left whitespace-normal min-w-[160px] max-w-[180px] flex-shrink-0 leading-tight text-sm snap-start"
              onClick={() => onPromptClick(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </Button>
          ))}
        </div>
        {/* Fade gradient to indicate scrollable content */}
        <div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
