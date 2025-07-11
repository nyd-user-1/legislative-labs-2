
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";

interface CardActionButtonsProps {
  onFavorite?: (e: React.MouseEvent) => void;
  onAIAnalysis?: (e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
  showFavorite?: boolean;
  showAIAnalysis?: boolean;
  size?: "sm" | "default";
  variant?: "outline" | "ghost";
}

export const CardActionButtons = ({
  onFavorite,
  onAIAnalysis,
  isFavorited = false,
  hasAIChat = false,
  showFavorite = true,
  showAIAnalysis = true,
  size = "sm",
  variant = "outline"
}: CardActionButtonsProps) => {
  if (!showFavorite && !showAIAnalysis) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {showFavorite && onFavorite && (
        <Button
          variant={variant}
          size={size}
          className="px-3"
          onClick={onFavorite}
          title="Add to Favorites"
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      )}
      {showAIAnalysis && onAIAnalysis && (
        <Button
          variant={variant}
          size={size}
          className="px-3"
          onClick={onAIAnalysis}
          title="AI Analysis"
        >
          <Sparkles className={`h-4 w-4 ${hasAIChat ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </Button>
      )}
    </div>
  );
};
