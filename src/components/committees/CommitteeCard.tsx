import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText } from "lucide-react";

type Committee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
};

interface CommitteeCardProps {
  committee: Committee;
  onCommitteeSelect: (committee: Committee) => void;
}

export const CommitteeCard = ({ committee, onCommitteeSelect }: CommitteeCardProps) => {
  return (
    <Card 
      className="card-interactive bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => onCommitteeSelect(committee)}
    >
      <CardHeader className="card-header px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight break-words">
            {committee.name}
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 flex-shrink-0">
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="card-body p-6">
        <div className="space-y-4">
          {committee.description && (
            <p className="text-sm text-gray-600 break-words">
              {committee.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Members</div>
                <div className="text-lg font-semibold text-gray-900">
                  {committee.memberCount}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Bills</div>
                <div className="text-lg font-semibold text-gray-900">
                  {committee.billCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};