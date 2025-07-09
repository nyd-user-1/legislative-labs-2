import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Copy, ThumbsUp, ThumbsDown, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useFavorites } from "@/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";
import { AIChatSheet } from "@/components/AIChatSheet";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

const Favorites = () => {
  const { favorites, loading, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<Bill | null>(null);

  const handleAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setChatOpen(true);
  };

  const handleRemoveFavorite = async (billId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(billId);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (type: "thumbs-up" | "thumbs-down") => {
    toast({
      title: "Feedback recorded",
      description: `Thank you for your ${type === "thumbs-up" ? "positive" : "negative"} feedback`,
    });
  };

  const getStatusBadgeVariant = (status: string | null) => {
    if (!status) return "secondary";
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes("passed") || lowercaseStatus.includes("signed")) return "default";
    if (lowercaseStatus.includes("committee")) return "outline";
    if (lowercaseStatus.includes("withdrawn") || lowercaseStatus.includes("died")) return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
            <p className="text-muted-foreground">Your favorite legislative bills</p>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length === 0 ? "No favorite bills yet" : `${favorites.length} favorite bills`}
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No favorite bills yet</h3>
              <p className="text-muted-foreground text-center">
                Start adding bills to your favorites by clicking the heart icon on the Bills page
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => {
              const bill = favorite.bill;
              
              return (
                <Card key={favorite.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-lg">{bill.bill_number || "No Number"}</CardTitle>
                          <Badge variant={getStatusBadgeVariant(bill.status_desc)} className="text-xs">
                            {bill.status_desc || "Unknown"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Added {format(new Date(favorite.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                          {bill.last_action_date && (
                            <span>Last action: {format(new Date(bill.last_action_date), "MMM d, yyyy")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleAIAnalysis(bill, e)}
                          className="hover:bg-primary/10"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleRemoveFavorite(bill.bill_id, e)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="bill-content" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2">
                          <div className="text-left">
                            <p className="font-medium">{bill.title || "No Title"}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {bill.description || "No description available"}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Bill Details</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Bill Number:</strong> {bill.bill_number || "N/A"}</p>
                                  <p><strong>Status:</strong> {bill.status_desc || "N/A"}</p>
                                  <p><strong>Committee:</strong> {bill.committee || "N/A"}</p>
                                  {bill.last_action && (
                                    <p><strong>Last Action:</strong> {bill.last_action}</p>
                                  )}
                                  {bill.last_action_date && (
                                    <p><strong>Last Action Date:</strong> {format(new Date(bill.last_action_date), "MMMM d, yyyy")}</p>
                                  )}
                                </div>
                              </div>
                              
                              {(bill.title || bill.description) && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Description</h4>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {bill.description || bill.title || "No description available"}
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(`${bill.title}\n\n${bill.description || ""}`)}
                                  className="h-8 px-2"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback("thumbs-up")}
                                  className="h-8 px-2"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback("thumbs-down")}
                                  className="h-8 px-2"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Chat Sheet */}
      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </div>
  );
};

export default Favorites;