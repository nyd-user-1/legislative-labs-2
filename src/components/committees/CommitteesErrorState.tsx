import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface CommitteesErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const CommitteesErrorState = ({ error, onRetry }: CommitteesErrorStateProps) => {
  return (
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load committees
            </h3>
            
            <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
              {error}
            </p>
            
            <Button 
              onClick={onRetry}
              className="btn-primary bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};