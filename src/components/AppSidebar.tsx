import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, Settings, User, FileText, Lightbulb, BarChart3, LogOut, Clock, X } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { title: "Problems", url: "/problems", icon: Search },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Drafts", url: "/", icon: FileText },
  { title: "Media Kits", url: "/media-kits", icon: BarChart3 },
  { title: "Bills Database", url: "/bills", icon: FileText },
];

const bottomNavItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
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
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";
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
      <SidebarHeader className="p-4">
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
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        {!collapsed && (
          <SidebarGroup>
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-2 h-5 w-5 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </SidebarGroup>
        )}

        {/* Search Results */}
        {!collapsed && searchResults.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Search Results</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {searchResults.map((result) => {
                  const TypeIcon = getTypeIcon(result.type);
                  return (
                    <SidebarMenuItem key={result.id}>
                      <SidebarMenuButton
                        onClick={() => handleSearchResultClick(result)}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <TypeIcon className="mr-2 h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
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

        {/* Main Navigation - Hidden when searching */}
        {(!searchTerm || searchResults.length === 0) && (
          <SidebarGroup>
            <SidebarGroupLabel>Workflow</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavClassName(item.url)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
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
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 w-8 p-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}