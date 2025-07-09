import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles } from "lucide-react";
import legislativeData from "@/data/legislative-data.json";

interface LegislativeItem {
  id: number;
  billNumber: string;
  title: string;
  status: string;
  committee: string;
  lastAction: string;
}

interface DataTableProps {
  data?: LegislativeItem[];
}

export function DataTable({ data = legislativeData }: DataTableProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleAIAnalysis = (item: LegislativeItem) => {
    // AI analysis functionality would be implemented here
    console.log("AI Analysis for", item.billNumber);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "introduced":
        return "secondary";
      case "in committee":
        return "outline";
      case "passed assembly":
      case "passed senate":
        return "default";
      default:
        return "secondary";
    }
  };

  const assemblyData = data.filter(item => item.billNumber.startsWith("A"));
  const senateData = data.filter(item => item.billNumber.startsWith("S"));
  const trendingData = data.slice(0, 3); // Mock trending data

  const renderTable = (items: LegislativeItem[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[100px]">Bill Number</TableHead>
          <TableHead className="min-w-[200px]">Title</TableHead>
          <TableHead className="min-w-[100px]">Status</TableHead>
          <TableHead className="min-w-[150px]">Committee</TableHead>
          <TableHead className="min-w-[100px]">Last Action</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell className="font-medium">{item.billNumber}</TableCell>
            <TableCell>
              <div className="max-w-[250px] truncate" title={item.title}>
                {item.title}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(item.status)} className="text-xs">
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {item.committee}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {item.lastAction}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(item.id);
                  }}
                  title="Add to Favorites"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.has(item.id) ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAIAnalysis(item);
                  }}
                  title="AI Analysis"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className="@container/main">
      <CardHeader>
        <CardTitle>Recent Legislative Activity</CardTitle>
        <CardDescription>
          A list of recent bills and their current status in the legislative process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="hidden @4xl/main:flex">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trending">
              Trending <Badge variant="secondary" className="ml-1">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="assembly">
              Assembly <Badge variant="secondary" className="ml-1">2</Badge>
            </TabsTrigger>
            <TabsTrigger value="senate">Senate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                {renderTable(data)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trending" className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                {renderTable(trendingData)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="assembly" className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                {renderTable(assemblyData)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="senate" className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                {renderTable(senateData)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}