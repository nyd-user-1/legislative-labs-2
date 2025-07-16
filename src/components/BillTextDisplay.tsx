
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useLegiscan } from "@/hooks/useLegiscan";
import { AlertCircle } from "lucide-react";

interface BillTextProps {
  billId: string;
  className?: string;
}

export const BillTextDisplay = ({ billId, className }: BillTextProps) => {
  const [billText, setBillText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getBillText } = useLegiscan();

  useEffect(() => {
    const fetchBillText = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching bill text for bill ID:', billId);
        const billIdNumber = parseInt(billId.toString());
        const response = await getBillText(billIdNumber);
        
        console.log('Bill text API response:', response);
        
        if (response && response.text) {
          let textContent = "";
          
          // Handle different response structures
          if (typeof response.text === 'string') {
            textContent = response.text;
          } else if (response.text.doc) {
            // Legiscan often returns text in a 'doc' field
            textContent = response.text.doc;
          } else if (response.text.text) {
            textContent = response.text.text;
          } else if (typeof response.text === 'object' && response.text.bill_text) {
            textContent = response.text.bill_text;
          }
          
          // If we have base64 encoded content, decode it
          if (textContent && textContent.includes('base64,')) {
            try {
              const base64Content = textContent.split('base64,')[1];
              textContent = atob(base64Content);
            } catch (decodeError) {
              console.error('Error decoding base64 content:', decodeError);
            }
          }
          
          console.log('Processed bill text length:', textContent?.length || 0);
          
          if (textContent && textContent.trim()) {
            setBillText(textContent);
          } else {
            setError("Bill text content is empty");
          }
        } else {
          console.error('No text field in response:', response);
          setError("Bill text not available in API response");
        }
      } catch (err) {
        console.error("Error fetching bill text:", err);
        setError(`Failed to load bill text: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (billId) {
      fetchBillText();
    }
  }, [billId, getBillText]);

  const formatBillText = (text: string) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Process line for highlighting
      let processedLine = line;
      
      // Simple regex to find text that might be amendments (words in brackets or with specific formatting)
      processedLine = processedLine.replace(
        /(\[.*?\]|\b(?:added|amended|inserted|deleted|substituted)\b)/gi,
        '<span class="text-green-700 underline decoration-green-600">$1</span>'
      );
      
      return {
        lineNumber: index + 1,
        content: processedLine,
        originalContent: line
      };
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bill Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bill Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedLines = formatBillText(billText);

  if (!billText || formattedLines.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bill Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No bill text available for this legislation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">Bill Text</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="max-h-screen overflow-y-auto">
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {formattedLines.map((line, index) => (
              <div key={index} className="flex">
                <span className="text-gray-400 text-sm w-8 inline-block text-right mr-4 flex-shrink-0 select-none">
                  {line.lineNumber}
                </span>
                <span 
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: line.content }}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
