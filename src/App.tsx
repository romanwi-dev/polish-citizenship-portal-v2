import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import Index from "./pages/Index";
import Cases from "./pages/Cases";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Client portal pages
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ClientIntakeWizard = lazy(() => import("./pages/ClientIntakeWizard"));

// Lazy load admin pages to avoid loading Sidebar on home page
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CasesManagement = lazy(() => import("./pages/admin/CasesManagement"));
const NewCase = lazy(() => import("./pages/admin/NewCase"));
const CaseDetail = lazy(() => import("./pages/admin/CaseDetail"));
const AdditionalData = lazy(() => import("./pages/admin/AdditionalData"));
const FamilyTreeForm = lazy(() => import("./pages/admin/FamilyTreeForm"));
const FamilyTreePage = lazy(() => import("./pages/admin/FamilyTreePage"));
const FamilyHistoryForm = lazy(() => import("./pages/admin/FamilyHistoryForm"));
const POAForm = lazy(() => import("./pages/admin/POAForm"));
const CitizenshipForm = lazy(() => import("./pages/admin/CitizenshipForm"));
const CivilRegistryForm = lazy(() => import("./pages/admin/CivilRegistryForm"));
const IntakeForm = lazy(() => import("./pages/admin/IntakeForm"));
const IntakeDemo = lazy(() => import("./pages/admin/IntakeDemo"));
const FormScanner = lazy(() => import("./pages/admin/FormScanner"));
const QAHarness = lazy(() => import("./pages/admin/QAHarness"));
const DropboxMigration = lazy(() => import("./pages/admin/DropboxMigration"));
const AuthorityReview = lazy(() => import("./pages/admin/AuthorityReview"));
const SystemHealth = lazy(() => import("./pages/admin/SystemHealth"));
const PDFInspector = lazy(() => import("./pages/admin/PDFInspector"));
const PDFFieldInspector = lazy(() => import("./pages/admin/PDFFieldInspector"));
const ZeroErrorsChecklist = lazy(() => import("./pages/admin/ZeroErrorsChecklist"));
const UploadPDFTemplates = lazy(() => import("./pages/admin/UploadPDFTemplates"));
const ManualPDFUpload = lazy(() => import("./pages/admin/ManualPDFUpload"));
const CitizenshipFieldReview = lazy(() => import("./pages/admin/CitizenshipFieldReview"));
const BigPlanTracker = lazy(() => import("./pages/admin/BigPlanTracker"));
const TestingDashboard = lazy(() => import("./pages/admin/TestingDashboard"));
const FormsDemo = lazy(() => import("./pages/admin/FormsDemo"));
const Translations = lazy(() => import("./pages/admin/Translations"));
const ArchivesSearch = lazy(() => import("./pages/admin/ArchivesSearch"));
const DocumentsCollection = lazy(() => import("./pages/admin/DocumentsCollection"));
const PolishCivilActs = lazy(() => import("./pages/admin/PolishCivilActs"));
const PolishCitizenship = lazy(() => import("./pages/admin/PolishCitizenship"));
const PolishPassport = lazy(() => import("./pages/admin/PolishPassport"));
const ExtendedServices = lazy(() => import("./pages/admin/ExtendedServices"));
const OCRReview = lazy(() => import("./pages/admin/OCRReview"));
const BackgroundsDemo = lazy(() => import("./pages/admin/BackgroundsDemo"));
const HeroBackgroundsDemo = lazy(() => import("./pages/admin/HeroBackgroundsDemo"));
const SecurityAudit = lazy(() => import("./pages/admin/SecurityAudit"));
const Researcher = lazy(() => import("./pages/admin/Researcher"));
const Translator = lazy(() => import("./pages/admin/Translator"));
const Writer = lazy(() => import("./pages/admin/Writer"));
const Designer = lazy(() => import("./pages/admin/Designer"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Loading fallback for admin pages
const AdminLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cases" element={<Cases />} />
            
            {/* Client Portal Routes */}
            <Route 
              path="/client/login" 
              element={
                <Suspense fallback={<AdminLoader />}>
                  <ClientLogin />
                </Suspense>
              } 
            />
            <Route
              path="/client/dashboard/:caseId"
              element={
                <Suspense fallback={<AdminLoader />}>
                  <ClientDashboard />
                </Suspense>
              }
            />
            <Route
              path="/client/intake/:token"
              element={
                <Suspense fallback={<AdminLoader />}>
                  <ClientIntakeWizard />
                </Suspense>
              }
            />
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
            path="/admin/cases/new" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <NewCase />
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
          <Route 
            path="/admin/cases/:id/additional-data"
            element={
              <Suspense fallback={<AdminLoader />}>
                <AdditionalData />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/intake-demo" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <IntakeDemo />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/form-scanner"
            element={
              <Suspense fallback={<AdminLoader />}>
                <FormScanner />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/qa-harness" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <QAHarness />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/dropbox-migration" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <DropboxMigration />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases/:id/authority-review" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AuthorityReview />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/system-health" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <SystemHealth />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-inspector" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PDFInspector />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-field-inspector" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PDFFieldInspector />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/zero-errors-checklist" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <ZeroErrorsChecklist />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/upload-pdf-templates" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <UploadPDFTemplates />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/manual-pdf-upload" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <ManualPDFUpload />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/citizenship-field-review" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <CitizenshipFieldReview />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/big-plan-tracker" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <BigPlanTracker />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/testing-dashboard" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <TestingDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/forms-demo" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <FormsDemo />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/documents-collection/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <DocumentsCollection />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/civil-acts" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PolishCivilActs />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/citizenship" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PolishCitizenship />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/passport" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PolishPassport />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/archives-search"
            element={
              <Suspense fallback={<AdminLoader />}>
                <ArchivesSearch />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translations" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Translations />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/extended-services" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <ExtendedServices />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ocr-review" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <OCRReview />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/backgrounds-demo" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <BackgroundsDemo />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/hero-backgrounds-demo" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <HeroBackgroundsDemo />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/security-audit"
            element={
              <Suspense fallback={<AdminLoader />}>
                <SecurityAudit />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/researcher" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Researcher />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translator" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Translator />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/writer" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Writer />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/designer" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Designer />
              </Suspense>
            } 
          />
          
          {/* Form Routes */}
          <Route 
            path="/admin/intake/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <IntakeForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/family-tree/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <FamilyTreeForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/family-tree-view/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <FamilyTreePage />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/family-history/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <FamilyHistoryForm />
              </Suspense>
            }
          />
          <Route 
            path="/admin/poa/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <POAForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/citizenship/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <CitizenshipForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/civil-registry/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <CivilRegistryForm />
              </Suspense>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
