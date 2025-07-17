
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
import { RouteLoadingFallback } from "@/components/RouteLoadingFallback";
import { PerformanceToggle } from "@/components/performance/PerformanceToggle";
import { Suspense } from "react";
import Landing from "./pages/Landing";
import { Auth } from "./pages/Auth";
import {
  LazyBills,
  LazyMembers,
  LazyCommittees,
  LazyChangeLog,
  LazyChats,
  LazyFavorites,
  LazyPlayground,
  LazyPlans,
  LazyProfile,
  LazyIndex
} from "@/components/LazyRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

console.log("App component is loading");

const AppLayout = () => {
  const { selectedModel, setSelectedModel } = useModel();
  
  return (
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
              <Suspense fallback={<RouteLoadingFallback />}>
                <Routes>
                  <Route path="/home" element={<Landing />} />
                  <Route path="/chats" element={<LazyChats />} />
                  <Route path="/favorites" element={<LazyFavorites />} />
                  <Route path="/playground" element={<LazyPlayground />} />
                  <Route path="/bills" element={<LazyBills />} />
                  <Route path="/members" element={<LazyMembers />} />
                  <Route path="/committees" element={<LazyCommittees />} />
                  <Route path="/plans" element={<LazyPlans />} />
                  <Route path="/profile" element={<LazyProfile />} />
                  <Route path="/changelog" element={<LazyChangeLog />} />
                  <Route path="/dashboard" element={<LazyIndex />} />
                </Routes>
              </Suspense>
            </main>
          </SidebarInset>
        </div>
        {/* Performance monitoring toggle - only shows in development */}
        <PerformanceToggle />
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
