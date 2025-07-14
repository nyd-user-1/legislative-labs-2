
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProblemsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ProblemsErrorState = ({ error, onRetry }: ProblemsErrorStateProps) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Problems</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
        </AlertDescription>
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm" 
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </Alert>
    </div>
  );
};
