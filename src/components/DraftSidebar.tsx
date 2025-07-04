import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LegislativeDraft } from "@/types/legislation";
import { FileText, Plus, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DraftSidebarProps {
  currentDraft: LegislativeDraft | null;
  onDraftSelect: (draft: LegislativeDraft) => void;
}

export const DraftSidebar = ({ currentDraft, onDraftSelect }: DraftSidebarProps) => {
  const [drafts, setDrafts] = useState<LegislativeDraft[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const savedDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    setDrafts(savedDrafts);
  };

  const createNewDraft = () => {
    const newDraft: LegislativeDraft = {
      id: crypto.randomUUID(),
      title: "New Draft",
      type: 'Bill',
      originalIdea: "",
      improvedIdea: "",
      draftContent: "",
      analysis: {
        fiscalImpact: "",
        implementationTimeline: "",
        similarLegislation: [],
        stakeholders: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedDrafts = [...drafts, newDraft];
    setDrafts(updatedDrafts);
    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));
    onDraftSelect(newDraft);

    toast({
      title: "New draft created",
      description: "Start by entering your legislative idea.",
    });
  };

  const deleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));

    if (currentDraft?.id === draftId) {
      onDraftSelect(updatedDrafts[0] || null);
    }

    toast({
      title: "Draft deleted",
      description: "Draft has been permanently removed.",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Bill': return 'bg-blue-100 text-blue-800';
      case 'Resolution': return 'bg-green-100 text-green-800';
      case 'Amendment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sidebar className="w-72 border-r">
      <SidebarContent>
        <div className="p-4 border-b">
          <Button onClick={createNewDraft} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Draft
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Drafts ({drafts.length})
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {drafts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No drafts yet</p>
                  <p className="text-xs">Create your first legislative draft</p>
                </div>
              ) : (
                drafts.map((draft) => (
                  <SidebarMenuItem key={draft.id}>
                    <SidebarMenuButton 
                      onClick={() => onDraftSelect(draft)}
                      className={`w-full justify-start p-3 h-auto ${
                        currentDraft?.id === draft.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate flex-1">
                            {draft.title || 'Untitled Draft'}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteDraft(draft.id, e)}
                            className="h-6 w-6 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${getTypeColor(draft.type)}`}>
                            {draft.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(draft.updatedAt)}
                        </div>
                        
                        {draft.originalIdea && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {draft.originalIdea.substring(0, 60)}...
                          </p>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};