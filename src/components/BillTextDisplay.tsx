
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
        
        console.log('Full Bill text API response:', JSON.stringify(response, null, 2));
        
        if (response && response.text) {
          let textContent = "";
          
          // Handle different response structures - be more aggressive in finding text
          if (typeof response.text === 'string') {
            textContent = response.text;
          } else if (response.text.doc) {
            textContent = response.text.doc;
          } else if (response.text.text) {
            textContent = response.text.text;
          } else if (typeof response.text === 'object') {
            // Try to find any text field in the object
            const textFields = ['bill_text', 'document', 'content', 'body'];
            for (const field of textFields) {
              if (response.text[field]) {
                textContent = response.text[field];
                break;
              }
            }
            
            // If still no text found, try to get the first string value
            if (!textContent) {
              const values = Object.values(response.text);
              const firstStringValue = values.find(val => typeof val === 'string' && val.length > 10);
              if (firstStringValue) {
                textContent = firstStringValue as string;
              }
            }
          }
          
          console.log('Raw text content found:', textContent?.substring(0, 200) + '...');
          
          // Handle base64 encoded content
          if (textContent && textContent.includes('base64,')) {
            try {
              const base64Content = textContent.split('base64,')[1];
              textContent = atob(base64Content);
              console.log('Decoded base64 content');
            } catch (decodeError) {
              console.error('Error decoding base64 content:', decodeError);
            }
          }
          
          // Handle URL encoded content
          if (textContent && textContent.includes('%')) {
            try {
              textContent = decodeURIComponent(textContent);
              console.log('Decoded URL encoded content');
            } catch (decodeError) {
              console.error('Error decoding URL content:', decodeError);
            }
          }
          
          console.log('Final processed bill text length:', textContent?.length || 0);
          
          if (textContent && textContent.trim()) {
            setBillText(textContent.trim());
          } else {
            setError("Bill text content is empty or could not be processed");
          }
        } else if (response && typeof response === 'object') {
          // Sometimes the entire response might be the text content
          console.log('Attempting to use entire response as text');
          const responseStr = JSON.stringify(response, null, 2);
          if (responseStr.length > 50) {
            setBillText(responseStr);
          } else {
            setError("Bill text not available in API response");
          }
        } else {
          console.error('No usable text field in response:', response);
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
    
    // Split by lines and handle various line endings
    const lines = text.split(/\r?\n|\r/);
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
        <ScrollArea className="max-h-[600px] overflow-y-auto">
          <div className="font-mono text-sm leading-relaxed">
            {formattedLines.map((line, index) => (
              <div key={index} className="flex">
                <span className="text-gray-400 text-sm w-8 inline-block text-right mr-4 flex-shrink-0 select-none">
                  {line.lineNumber}
                </span>
                <span 
                  className="flex-1 whitespace-pre-wrap break-words"
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
