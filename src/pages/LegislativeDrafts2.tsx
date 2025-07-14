
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftGeneratorTab } from "@/components/drafts/DraftGeneratorTab";
import { SolutionGeneratorTab } from "@/components/drafts/SolutionGeneratorTab";
import { MediaGeneratorTab } from "@/components/drafts/MediaGeneratorTab";
import { MyDraftsTab } from "@/components/drafts/MyDraftsTab";
import { CollaborativeDraftsTab } from "@/components/drafts/CollaborativeDraftsTab";
import { PublicGalleryTab } from "@/components/drafts/PublicGalleryTab";

const LegislativeDrafts2 = () => {
  const [activeTab, setActiveTab] = useState("generator");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Process</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and collaborate on legislative proposals with AI assistance.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="generator">Problem</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="my-drafts">Policy</TabsTrigger>
            <TabsTrigger value="collaborative">Partner</TabsTrigger>
            <TabsTrigger value="gallery">Project</TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <DraftGeneratorTab />
          </TabsContent>

          <TabsContent value="solution">
            <SolutionGeneratorTab />
          </TabsContent>

          <TabsContent value="media">
            <MediaGeneratorTab />
          </TabsContent>

          <TabsContent value="my-drafts">
            <MyDraftsTab />
          </TabsContent>

          <TabsContent value="collaborative">
            <CollaborativeDraftsTab />
          </TabsContent>

          <TabsContent value="gallery">
            <PublicGalleryTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LegislativeDrafts2;
