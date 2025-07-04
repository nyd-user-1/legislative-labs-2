import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DraftDisplayProps {
  draftContent: string;
}

export const DraftDisplay = ({ draftContent }: DraftDisplayProps) => {
  if (!draftContent) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legislative Draft</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-background border rounded-lg p-6">
          <div className="prose max-w-none font-serif">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{draftContent}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};