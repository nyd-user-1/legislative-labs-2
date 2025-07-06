import { Lightbulb } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Lightbulb className="h-5 w-5 text-primary-foreground" />
      </div>
      {!collapsed && (
        <div>
          <h1 className="text-lg font-bold">Idea Lab</h1>
          <p className="text-xs text-muted-foreground">Legislative Solutions</p>
        </div>
      )}
    </div>
  );
}