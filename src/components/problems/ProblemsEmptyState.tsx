
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProblemsEmptyStateProps {
  hasFilters: boolean;
  onCreateNew?: () => void;
}

export const ProblemsEmptyState = ({ hasFilters, onCreateNew }: ProblemsEmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No problems found</h3>
        <p className="mt-2 text-muted-foreground">
          Try adjusting your search criteria or clear the filters to see all problems.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No problem chats yet</h3>
      <p className="mt-2 text-muted-foreground">
        Get started by creating your first problem statement to begin the policy development process.
      </p>
      {onCreateNew && (
        <Button onClick={onCreateNew} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Create Problem Statement
        </Button>
      )}
    </div>
  );
};
