
import { ScrollArea } from "@/components/ui/scroll-area";

interface BillTextContentProps {
  billText: string;
}

export const BillTextContent = ({ billText }: BillTextContentProps) => {
  // Clean up the HTML content for better display
  const cleanBillText = billText
    .replace(/<[^>]*>/g, '') // Remove HTML tags for now - can be enhanced later
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  return (
    <ScrollArea className="h-96 w-full">
      <div 
        className="bill-text-content whitespace-pre-wrap text-sm leading-relaxed p-4"
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#333'
        }}
      >
        {cleanBillText}
      </div>
    </ScrollArea>
  );
};
