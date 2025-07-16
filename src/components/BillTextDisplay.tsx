
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
  const { getBill, getBillText } = useLegiscan();

  useEffect(() => {
    const fetchBillText = async () => {
      if (!billId) return;
      
      try {
        setLoading(true);
        setError(null);
        setBillText("");
        
        console.log('Fetching bill text for bill ID:', billId);
        
        // First, get the bill details to find the text document ID
        const billIdNumber = parseInt(billId.toString());
        console.log('Parsed bill ID number:', billIdNumber);
        
        const billResponse = await getBill(billIdNumber);
        console.log('Bill details response:', billResponse);
        
        if (!billResponse) {
          setError("No response received from bill details API");
          return;
        }
        
        if (billResponse.status === 'ERROR') {
          setError(`API Error: ${billResponse.error || 'Unknown error'}`);
          return;
        }
        
        if (!billResponse.bill) {
          setError("Bill details not found in API response");
          return;
        }
        
        // Check if the bill has text documents
        if (!billResponse.bill.texts || !Array.isArray(billResponse.bill.texts) || billResponse.bill.texts.length === 0) {
          setError("No bill text documents available for this legislation");
          return;
        }
        
        // Get the text document ID (usually the first/latest version)
        const textDocument = billResponse.bill.texts[0];
        if (!textDocument || !textDocument.doc_id) {
          setError("Text document ID not found");
          return;
        }
        
        const textDocId = textDocument.doc_id;
        console.log('Fetching text document ID:', textDocId);
        
        // Now get the actual bill text
        const textResponse = await getBillText(textDocId);
        console.log('Bill text API response structure:', textResponse);
        
        if (!textResponse) {
          setError("No response received from bill text API");
          return;
        }
        
        if (textResponse.status === 'ERROR') {
          setError(`Text API Error: ${textResponse.error || 'Unknown error'}`);
          return;
        }
        
        if (!textResponse.text) {
          setError("Bill text data not found in API response");
          return;
        }
        
        // Handle different response structures and decode base64
        let decodedText = "";
        
        if (textResponse.text.doc) {
          // The main content is in the 'doc' field and is base64 encoded
          try {
            decodedText = atob(textResponse.text.doc);
            console.log('Successfully decoded base64 content, length:', decodedText.length);
          } catch (decodeError) {
            console.error('Error decoding base64 content:', decodeError);
            setError("Unable to decode bill text content - content may not be base64 encoded");
            // Try using the content directly
            decodedText = textResponse.text.doc;
          }
        } else if (typeof textResponse.text === 'string') {
          // Sometimes the text might be directly available
          decodedText = textResponse.text;
          console.log('Using direct text content, length:', decodedText.length);
        } else {
          console.error('Unexpected text response structure:', textResponse.text);
          setError("Unexpected bill text format received from API");
          return;
        }
        
        if (!decodedText || decodedText.trim().length === 0) {
          setError("Bill text content is empty after processing");
          return;
        }
        
        setBillText(decodedText);
        console.log('Successfully set bill text, length:', decodedText.length);
        
      } catch (err) {
        console.error("Error in fetchBillText:", err);
        if (err instanceof Error) {
          setError(`Failed to load bill text: ${err.message}`);
        } else {
          setError('Failed to load bill text: Unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBillText();
  }, [billId, getBill, getBillText]);

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
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Unable to Load Bill Text</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!billText) {
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
        <ScrollArea className="h-96 w-full">
          <div 
            className="bill-text-content whitespace-pre-wrap text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: billText }}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '13px',
              lineHeight: '1.5',
              color: '#333'
            }}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
