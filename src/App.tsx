import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ModelSelector, ModelType } from "@/components/ModelSelector";
import { useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Bills from "./pages/Bills";
import Problems from "./pages/Problems";
import Ideas from "./pages/Ideas";
import MediaKits from "./pages/MediaKits";

const queryClient = new QueryClient();

console.log("App component is loading");

const App = () => {
  console.log("App component is rendering");
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="*" 
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="min-h-screen flex w-full">
                        <AppSidebar />
                        <SidebarInset className="flex-1">
                          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="ml-auto">
                              <ModelSelector 
                                selectedModel={selectedModel}
                                onModelChange={setSelectedModel}
                              />
                            </div>
                          </header>
                          <main className="flex-1">
                            <Routes>
                              <Route path="/problems" element={<Problems />} />
                              <Route path="/ideas" element={<Ideas />} />
                              <Route path="/media-kits" element={<MediaKits />} />
                              <Route path="/bills" element={<Bills />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/" element={<Index />} />
                            </Routes>
                          </main>
                        </SidebarInset>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
