import { useSidebar } from "@/components/ui/sidebar";

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div className="flex items-center justify-center space-x-2">
      {!collapsed && (
        <div className="text-center">
          <h1 className="text-lg font-bold">New York Digital</h1>
        </div>
      )}
    </div>
  );
}