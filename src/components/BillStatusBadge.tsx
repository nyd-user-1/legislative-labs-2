import { Badge } from "@/components/ui/badge";

interface BillStatusBadgeProps {
  status: number;
  statusDesc?: string;
}

export const BillStatusBadge = ({ status, statusDesc }: BillStatusBadgeProps) => {
  const getStatusVariant = (status: number) => {
    switch (status) {
      case 1:
        return "secondary"; // Introduced
      case 2:
        return "default"; // Committee
      case 3:
        return "outline"; // Floor
      case 4:
        return "default"; // Passed
      case 5:
        return "destructive"; // Failed/Defeated
      case 6:
        return "secondary"; // Signed/Enacted
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-brand-100 text-brand-700 border-brand-200"; // Introduced
      case 2:
        return "bg-blue-100 text-blue-700 border-blue-200"; // Committee
      case 3:
        return "bg-yellow-100 text-yellow-700 border-yellow-200"; // Floor
      case 4:
        return "bg-green-100 text-green-700 border-green-200"; // Passed
      case 5:
        return "bg-red-100 text-red-700 border-red-200"; // Failed
      case 6:
        return "bg-purple-100 text-purple-700 border-purple-200"; // Signed
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={`${getStatusColor(status)} font-medium`}
    >
      {statusDesc || `Status ${status}`}
    </Badge>
  );
};