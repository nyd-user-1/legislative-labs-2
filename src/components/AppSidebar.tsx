import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, Settings, User, FileText, Lightbulb, BarChart3, LogOut, Clock, X, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearch, SearchResult } from "@/hooks/useSearch";

const mainNavItems = [
  { title: "Problems", url: "/problems", icon: Search, description: "Identify key issues" },
  { title: "Ideas", url: "/ideas", icon: Lightbulb, description: "Develop solutions" },
  { title: "Drafts", url: "/", icon: FileText, description: "Create legislation" },
  { title: "Media Kits", url: "/media-kits", icon: BarChart3, description: "Build campaigns" },
  { title: "Bills Database", url: "/bills", icon: FileText, description: "Explore existing bills" },
];

const bottomNavItems = [
  { title: "Profile", url: "/profile", icon: User, description: "Manage account" },
  { title: "Settings", url: "/settings", icon: Settings, description: "App preferences" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { searchTerm, setSearchTerm, searchResults, clearSearch } = useSearch();

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-semibold shadow-sm" 
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors";
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    navigate(result.url);
    clearSearch();
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'problem': return Search;
      case 'idea': return Lightbulb;
      case 'draft': return FileText;
      case 'media': return BarChart3;
      default: return FileText;
    }
  };

  const getTypeBadgeVariant = (type: SearchResult['type']) => {
    switch (type) {
      case 'problem': return 'secondary';
      case 'idea': return 'outline';
      case 'draft': return 'default';
      case 'media': return 'destructive';
      default: return 'secondary';
    }
  };

  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Idea Lab
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Legislative Solutions</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        {!collapsed && (
          <SidebarGroup className="px-0">
            <div className="px-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search everything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 bg-background/60 border-muted-foreground/20 focus:bg-background transition-colors"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </SidebarGroup>
        )}

        {/* Quick Actions */}
        {!collapsed && !searchTerm && (
          <SidebarGroup className="px-0">
            <div className="px-4 pb-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs justify-start"
                  onClick={() => navigate("/problems")}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Problem
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs justify-start"
                  onClick={() => navigate("/ideas")}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Idea
                </Button>
              </div>
            </div>
          </SidebarGroup>
        )}

        {/* Search Results */}
        {!collapsed && searchResults.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground">
              Search Results
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {searchResults.map((result) => {
                  const TypeIcon = getTypeIcon(result.type);
                  return (
                    <SidebarMenuItem key={result.id}>
                      <SidebarMenuButton
                        onClick={() => handleSearchResultClick(result)}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground mx-2 rounded-md"
                      >
                        <TypeIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate">{result.title}</span>
                            <Badge variant={getTypeBadgeVariant(result.type)} className="ml-2 text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.content.substring(0, 50)}...
                          </p>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && searchResults.length > 0 && <Separator className="mx-4" />}

        {/* Main Navigation - Hidden when searching */}
        {(!searchTerm || searchResults.length === 0) && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground">
              Workflow
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`${getNavClassName(item.url)} mx-2 rounded-md`}
                      >
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs opacity-70">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClassName(item.url)} mx-2 rounded-md`}
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs opacity-70">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-muted/30">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">U</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}