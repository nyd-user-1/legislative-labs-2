import { Search, Settings, User, FileText, Lightbulb, BarChart3, Users, Building2, TrendingUp, MessageSquare } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavigationItem } from "./NavigationItem";
import { useNavigation } from "@/hooks/useNavigation";

const researchNavItems = [
  { title: "Dashboard", url: "/", icon: TrendingUp },
  { title: "Bills", url: "/bills", icon: FileText },
  { title: "Members", url: "/members", icon: Users },
  { title: "Committees", url: "/committees", icon: Building2 },
];

const workflowNavItems = [
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Problems", url: "/problems", icon: Search },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Media Kits", url: "/media-kits", icon: BarChart3 },
];

const bottomNavItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface SidebarNavigationProps {
  collapsed: boolean;
  hasSearchResults: boolean;
}

export function SidebarNavigation({ collapsed, hasSearchResults }: SidebarNavigationProps) {
  const { getNavClassName } = useNavigation();

  return (
    <>
      {/* Research Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <SidebarGroupLabel>Research</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {researchNavItems.map((item) => (
                <NavigationItem
                  key={item.title}
                  title={item.title}
                  url={item.url}
                  icon={item.icon}
                  collapsed={collapsed}
                  getNavClassName={getNavClassName}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Workflow Navigation - Hidden when searching */}
      {!hasSearchResults && (
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowNavItems.map((item) => (
                <NavigationItem
                  key={item.title}
                  title={item.title}
                  url={item.url}
                  icon={item.icon}
                  collapsed={collapsed}
                  getNavClassName={getNavClassName}
                />
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
              <NavigationItem
                key={item.title}
                title={item.title}
                url={item.url}
                icon={item.icon}
                collapsed={collapsed}
                getNavClassName={getNavClassName}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}