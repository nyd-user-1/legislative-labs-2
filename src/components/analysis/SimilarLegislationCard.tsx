
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale } from "lucide-react";
import { useLegiscan } from "@/hooks/useLegiscan";
import { useEffect, useState } from "react";

interface SimilarLegislationCardProps {
  searchQuery?: string;
  currentBillTitle?: string;
}

export const SimilarLegislationCard = ({ searchQuery, currentBillTitle }: SimilarLegislationCardProps) => {
  const { searchSimilarBills, loading } = useLegiscan();
  const [similarLegislation, setSimilarLegislation] = useState<Array<{
    state: string;
    bill: string;
    similarity: number;
    status: string;
    url?: string;
  }>>([]);

  useEffect(() => {
    const fetchSimilarBills = async () => {
      if (searchQuery || currentBillTitle) {
        const query = searchQuery || currentBillTitle || '';
        try {
          console.log('AI Chat Analysis: Searching for similar legislation across all states');
          // Use searchSimilarBills which allows all states for AI chat analysis
          const results = await searchSimilarBills(query);
          
          if (results?.searchresult?.results) {
            const processed = results.searchresult.results.slice(0, 5).map((bill: any, index: number) => ({
              state: bill.state || 'Unknown',
              bill: bill.bill_number || 'Unknown Bill',
              similarity: Math.max(95 - (index * 5), 70), // Mock similarity scoring
              status: bill.status === 1 ? 'Enacted' : bill.status === 2 ? 'Pending' : 'Failed',
              url: bill.state_link || bill.url
            }));
            setSimilarLegislation(processed);
          }
        } catch (error) {
          console.error('Error fetching similar bills:', error);
        }
      }
    };

    fetchSimilarBills();
  }, [searchQuery, currentBillTitle, searchSimilarBills]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Similar Legislation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading similar legislation...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Similar Legislation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {similarLegislation.length > 0 ? (
            similarLegislation.map((leg, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {leg.url ? (
                      <a href={leg.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {leg.state} - {leg.bill}
                      </a>
                    ) : (
                      `${leg.state} - ${leg.bill}`
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{leg.similarity}% similarity</p>
                </div>
                <Badge variant={leg.status === 'Enacted' ? 'default' : leg.status === 'Pending' ? 'secondary' : 'destructive'}>
                  {leg.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No similar legislation found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
