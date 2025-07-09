import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Target,
  Clock,
  MapPin,
  User,
  Building2,
  CheckCircle,
  Scale,
  TrendingUp
} from "lucide-react";
import { useBillDetailData } from "@/hooks/useBillDetailData";
import { useState } from "react";

export default function BillDetail() {
  const { id } = useParams();
  const { bill, loading, error, journeyEvents, analysisCategories } = useBillDetailData(id);
  const [activeCategory, setActiveCategory] = useState("impact");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (loading) return <div className="container mx-auto px-4 sm:px-6 py-6">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 sm:px-6 py-6">Error: {error}</div>;
  if (!bill) return <div className="container mx-auto px-4 sm:px-6 py-6">Bill not found</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mx-auto px-3 py-1 text-xs font-medium tracking-wide uppercase mb-4">
          Legislative Analysis
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
          {bill.title}
        </h1>
        <p className="text-gray-600 mx-auto max-w-2xl">
          Track the complete legislative journey and comprehensive analysis for {bill.bill_number}
        </p>
      </div>

      {/* Two Column Layout - EXACT COPY OF PROVIDED STRUCTURE */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Timeline Column - LEFT SIDE */}
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-2xl font-bold">Legislative Journey</h3>
          </div>

          {/* Vertical Timeline - EXACT COPY */}
          <div className="relative ml-[50px] border-l-2 border-blue-200 pt-2 pl-6">
            {journeyEvents.map((event, index) => (
              <div
                key={event.id}
                className={`relative mb-12 last:mb-0 ${index === 0 ? "pt-0" : "pt-2"}`}
              >
                {/* Timeline node */}
                <div
                  className={cn(
                    "absolute -left-[42px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-white",
                    event.status === "completed" ? "bg-green-500" : 
                    event.status === "current" ? "bg-blue-500" : "bg-gray-300"
                  )}
                >
                  {event.icon}
                </div>

                {/* Date badge */}
                <div className="absolute -top-2 -left-[30px] -translate-x-full">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs",
                      event.status === "completed"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : event.status === "current"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    )}
                  >
                    {event.date}
                  </Badge>
                </div>

                {/* Content */}
                <div className="group bg-white hover:border-blue-300 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md">
                  <h4 className="text-lg font-semibold">{event.title}</h4>
                  <p className="text-blue-600 text-sm font-medium">{event.subtitle}</p>
                  <p className="text-gray-600 mt-2 text-sm">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Column - RIGHT SIDE */}
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="text-2xl font-bold">Analysis by Category</h3>
          </div>

          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="mb-6 grid w-full grid-cols-3">
              {analysisCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {analysisCategories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="bg-white space-y-4 rounded-lg border p-6"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <h4 className="text-lg font-semibold">{category.name} Analysis</h4>
                </div>

                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>

                <div className="mt-6 space-y-5">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.level}
                        </Badge>
                      </div>
                      <Progress
                        value={item.value}
                        className={cn(
                          "h-2.5",
                          hoveredItem === item.name ? "animate-pulse" : ""
                        )}
                      />
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          View Full Text
        </Button>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Track This Bill
        </Button>
      </div>
    </div>
  );
}