
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModelProvider, useModel } from "@/contexts/ModelContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ModelSelector } from "@/components/ModelSelector";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import Profile from "./pages/Profile";
import Bills from "./pages/Bills";
import Members from "./pages/Members";
import Committees from "./pages/Committees";
import Chats from "./pages/Chats";
import Favorites from "./pages/Favorites";
import Playground from "./pages/Playground";
import Plans from "./pages/Plans";
import ChangeLog from "./pages/ChangeLog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";

const queryClient = new QueryClient();

console.log("App component is loading");

const AppLayout = () => {
  const { selectedModel, setSelectedModel } = useModel();
  const { searchTerm, setSearchTerm } = useSearch();
  
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              
              {/* Search function positioned between sidebar and AI engine dropdown */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
              
              <div className="ml-auto">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </header>
            <main className="flex-1">
              <Routes>
                <Route path="/home" element={<Landing />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/members" element={<Members />} />
                <Route path="/committees" element={<Committees />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/changelog" element={<ChangeLog />} />
                <Route path="/dashboard" element={<Index />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

const App = () => {
  console.log("App component is rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ModelProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<AppLayout />} />
              </Routes>
            </BrowserRouter>
          </ModelProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
