import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cases from "./pages/Cases";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazy load admin pages to avoid loading Sidebar on home page
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CasesManagement = lazy(() => import("./pages/admin/CasesManagement"));
const CaseDetail = lazy(() => import("./pages/admin/CaseDetail"));

const queryClient = new QueryClient();

// Loading fallback for admin pages
const AdminLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cases" element={<Cases />} />
          
          {/* Admin Routes - Lazy Loaded */}
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Dashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <CasesManagement />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <CaseDetail />
              </Suspense>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
