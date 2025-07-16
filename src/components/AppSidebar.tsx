
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { BarChart3, FileText, Users, Building, MessageSquare, Heart, TestTube, CreditCard, User, Settings, FileBarChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const researchItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Bills",
    url: "/bills",
    icon: FileText,
  },
  {
    title: "Members",
    url: "/members",
    icon: Users,
  },
  {
    title: "Committees",
    url: "/committees",
    icon: Building,
  },
];

const workflowItems = [
  {
    title: "Chats",
    url: "/chats",
    icon: MessageSquare,
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Heart,
  },
  {
    title: "Playground",
    url: "/playground",
    icon: TestTube,
  },
];

const accountItems = [
  {
    title: "Plans",
    url: "/plans",
    icon: CreditCard,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Change Log",
    url: "/changelog",
    icon: FileBarChart,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-4 py-2">NY Digital</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Research</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {researchItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
