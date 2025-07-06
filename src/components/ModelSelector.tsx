import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Bot, Zap, Search } from "lucide-react";

export type ModelProvider = "openai" | "claude" | "perplexity";
export type ModelType = "gpt-4" | "gpt-3.5-turbo" | "claude-3-opus" | "claude-3-sonnet" | "claude-3-haiku" | "llama-3.1-sonar-small-128k-online" | "llama-3.1-sonar-large-128k-online" | "llama-3.1-sonar-huge-128k-online";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const models: Record<ModelProvider, { name: string; models: { id: ModelType; name: string; description: string }[] }> = {
  openai: {
    name: "OpenAI",
    models: [
      { id: "gpt-4", name: "GPT-4", description: "Most capable model" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and efficient" },
    ]
  },
  claude: {
    name: "Anthropic Claude", 
    models: [
      { id: "claude-3-opus", name: "Claude 3 Opus", description: "Most powerful reasoning" },
      { id: "claude-3-sonnet", name: "Claude 3 Sonnet", description: "Balanced performance" },
      { id: "claude-3-haiku", name: "Claude 3 Haiku", description: "Fastest responses" },
    ]
  },
  perplexity: {
    name: "Perplexity AI",
    models: [
      { id: "llama-3.1-sonar-small-128k-online", name: "Sonar Small", description: "Fast with real-time search" },
      { id: "llama-3.1-sonar-large-128k-online", name: "Sonar Large", description: "Balanced with web access" },
      { id: "llama-3.1-sonar-huge-128k-online", name: "Sonar Huge", description: "Most capable with search" },
    ]
  }
};

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  const getCurrentModelInfo = () => {
    for (const provider of Object.values(models)) {
      const model = provider.models.find(m => m.id === selectedModel);
      if (model) return model;
    }
    return models.openai.models[0];
  };

  const currentModel = getCurrentModelInfo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span className="truncate">{currentModel.name}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {Object.entries(models).map(([providerId, provider]) => (
          <div key={providerId}>
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              {provider.name}
            </div>
            {provider.models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`cursor-pointer ${selectedModel === model.id ? 'bg-accent' : ''}`}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {providerId === 'openai' ? (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Zap className="h-3 w-3 text-green-600" />
                      </div>
                    ) : providerId === 'perplexity' ? (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Search className="h-3 w-3 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{model.name}</p>
                      {selectedModel === model.id && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};