import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Sparkles, Share2 } from "lucide-react";
import { MyDraftsTab } from "@/components/drafts/MyDraftsTab";
import { CollaborativeDraftsTab } from "@/components/drafts/CollaborativeDraftsTab";
import { DraftGeneratorTab } from "@/components/drafts/DraftGeneratorTab";
import { PublicGalleryTab } from "@/components/drafts/PublicGalleryTab";

const LegislativeDrafts = () => {
  const [activeTab, setActiveTab] = useState("my-drafts");

  return (
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legislative Drafts</h1>
            <p className="text-gray-600 mt-2">
              Create, collaborate, and share legislative proposals
            </p>
          </div>
          <Button className="btn-primary bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Draft
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger 
              value="my-drafts" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-100"
            >
              <FileText className="w-4 h-4" />
              My Drafts
            </TabsTrigger>
            <TabsTrigger 
              value="collaborative" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-100"
            >
              <Users className="w-4 h-4" />
              Collaborative
            </TabsTrigger>
            <TabsTrigger 
              value="generator" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-100"
            >
              <Sparkles className="w-4 h-4" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger 
              value="public-gallery" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-100"
            >
              <Share2 className="w-4 h-4" />
              Public Gallery
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="my-drafts" className="space-y-6">
              <MyDraftsTab />
            </TabsContent>

            <TabsContent value="collaborative" className="space-y-6">
              <CollaborativeDraftsTab />
            </TabsContent>

            <TabsContent value="generator" className="space-y-6">
              <DraftGeneratorTab />
            </TabsContent>

            <TabsContent value="public-gallery" className="space-y-6">
              <PublicGalleryTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default LegislativeDrafts;