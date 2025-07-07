import { useState, useRef, useEffect } from "react";
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
      { id: "gpt-4", name: "ChatGPT-4", description: "Most capable model" },
      { id: "gpt-3.5-turbo", name: "ChatGPT-3.5 Turbo", description: "Fast and efficient" },
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCurrentModelInfo = () => {
    for (const provider of Object.values(models)) {
      const model = provider.models.find(m => m.id === selectedModel);
      if (model) return model;
    }
    return models.openai.models[0];
  };

  const currentModel = getCurrentModelInfo();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleModelSelect = (model: ModelType) => {
    onModelChange(model);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:border-gray-500 transition-colors"
      >
        <Bot className="h-4 w-4" />
        <span className="truncate">{currentModel.name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-50">
          {/* OpenAI section */}
          <div>
            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                OpenAI
              </div>
            </div>
            {models.openai.models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{model.name}</span>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100 mt-1 pt-1" />

          {/* Anthropic Claude section */}
          <div>
            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <Bot className="h-3 w-3" />
                Anthropic Claude
              </div>
            </div>
            {models.claude.models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{model.name}</span>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100 mt-1 pt-1" />

          {/* Perplexity AI section */}
          <div>
            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3" />
                Perplexity AI
              </div>
            </div>
            {models.perplexity.models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{model.name}</span>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};