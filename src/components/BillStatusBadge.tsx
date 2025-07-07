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
        return "bg-green-100 text-green-700 border-green-200"; // Introduced - Green
      case 2:
        return "bg-orange-100 text-orange-700 border-orange-200"; // Committee - Orange
      case 3:
        return "bg-blue-100 text-blue-700 border-blue-200"; // Floor - Blue
      case 4:
        return "bg-blue-100 text-blue-700 border-blue-200"; // Passed - Blue
      case 5:
        return "bg-red-100 text-red-700 border-red-200"; // Failed - Red
      case 6:
        return "bg-purple-100 text-purple-700 border-purple-200"; // Signed - Purple
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"; // Default - Gray
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