
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModelProvider, useModel } from "@/contexts/ModelContext";
import { ColorSchemeProvider } from "@/contexts/ColorSchemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { HeartSidebarTrigger } from "@/components/HeartSidebarTrigger";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import Profile from "./pages/Profile";
import Bills from "./pages/Bills";
import Members from "./pages/Members";
import Committees from "./pages/Committees";
import Chats from "./pages/Chats";
import Favorites from "./pages/Favorites";
import Playground from "./pages/Playground";
import PolicyPortal from "./pages/PolicyPortal";
import Plans from "./pages/Plans";
import ChangeLog from "./pages/ChangeLog";
import ProblemPage from "./pages/ProblemPage";
import Problems from "./pages/Problems";

const queryClient = new QueryClient();

console.log("App component is loading");

const AppLayout = () => {
  const { selectedModel, setSelectedModel } = useModel();
  
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-[#F6F4EE]">
              <HeartSidebarTrigger />
              <div className="ml-auto">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </header>
            <main className="flex-1">
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/policy-portal" element={<PolicyPortal />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/members" element={<Members />} />
                <Route path="/problems" element={<Problems />} />
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
          <ColorSchemeProvider>
            <ModelProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/problems/:problemSlug" element={<ProblemPage />} />
                  <Route path="*" element={<AppLayout />} />
                </Routes>
              </BrowserRouter>
            </ModelProvider>
          </ColorSchemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
