import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { LanguageRedirect } from "@/components/LanguageRedirect";
import { LanguageSyncWrapper } from "@/components/LanguageSyncWrapper";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { AppRouter } from "@/components/AppRouter";
import Index from "./pages/Index";
import Cases from "./pages/Cases";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const ContactFormsDemo = lazy(() => import("./pages/ContactFormsDemo"));
const TranslationDemo = lazy(() => import("./pages/TranslationDemo"));
const HeroGallery = lazy(() => import("./pages/HeroGallery"));


// Client portal pages
const PortalIndex = lazy(() => import("./pages/PortalIndex"));
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ClientSecurity = lazy(() => import("./pages/ClientSecurity"));
const ClientIntakeWizard = lazy(() => import("./pages/ClientIntakeWizard"));
const RequestAccess = lazy(() => import("./pages/RequestAccess"));

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
const PDFSystemVerification = lazy(() => import("./pages/admin/PDFSystemVerification"));
const PDFFieldInspectorNew = lazy(() => import("./pages/PDFFieldInspector"));
const ZeroErrorsChecklist = lazy(() => import("./pages/admin/ZeroErrorsChecklist"));
const UploadPDFTemplates = lazy(() => import("./pages/admin/UploadPDFTemplates"));
const ManualPDFUpload = lazy(() => import("./pages/admin/ManualPDFUpload"));
const CitizenshipFieldReview = lazy(() => import("./pages/admin/CitizenshipFieldReview"));
const BigPlanTracker = lazy(() => import("./pages/admin/BigPlanTracker"));
const TestingDashboard = lazy(() => import("./pages/admin/TestingDashboard"));
const FormsDemo = lazy(() => import("./pages/admin/FormsDemo"));
const Translations = lazy(() => import("./pages/admin/Translations"));
const ArchivesSearch = lazy(() => import("./pages/admin/ArchivesSearch"));
const TranslationsWorkflow = lazy(() => import("./pages/admin/TranslationsWorkflow"));
const ArchivesWorkflow = lazy(() => import("./pages/admin/ArchivesWorkflow"));
const PassportWorkflow = lazy(() => import("./pages/admin/PassportWorkflow"));
const DropboxWorkflow = lazy(() => import("./pages/admin/DropboxWorkflow"));
const AllWorkflows = lazy(() => import("./pages/admin/AllWorkflows"));
const WorkflowNotifications = lazy(() => import("./pages/admin/WorkflowNotifications"));
const AIWorkflow = lazy(() => import("./pages/admin/AIWorkflow"));
const TranslationWorkflowTest = lazy(() => import("./pages/admin/TranslationWorkflowTest"));
const DocumentsCollection = lazy(() => import("./pages/admin/DocumentsCollection"));
const PolishCivilActs = lazy(() => import("./pages/admin/PolishCivilActs"));
const PolishCitizenship = lazy(() => import("./pages/admin/PolishCitizenship"));
const PolishPassport = lazy(() => import("./pages/admin/PolishPassport"));
const ExtendedServices = lazy(() => import("./pages/admin/ExtendedServices"));
const OCRReview = lazy(() => import("./pages/admin/OCRReview"));
const DocumentBrowser = lazy(() => import("./pages/admin/DocumentBrowser"));
// Removed unused 3D demo pages for performance
const SecurityAudit = lazy(() => import("./pages/admin/SecurityAudit"));
const Researcher = lazy(() => import("./pages/admin/Researcher"));
const Translator = lazy(() => import("./pages/admin/Translator"));
const Writer = lazy(() => import("./pages/admin/Writer"));
const Designer = lazy(() => import("./pages/admin/Designer"));
const Supervisor = lazy(() => import("./pages/admin/Supervisor"));
const OCRProcessingMonitor = lazy(() => import("./pages/admin/OCRProcessingMonitor"));
const AIAgentDiagnostics = lazy(() => import("./pages/admin/AIAgentDiagnostics"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const SystemOverview = lazy(() => import("./pages/admin/SystemOverview"));
const AIAgentsDashboard = lazy(() => import("./pages/admin/AIAgentsDashboard"));
const AgentApprovals = lazy(() => import("./pages/admin/AgentApprovals"));
const VerifyChanges = lazy(() => import("./pages/VerifyChanges"));
const VerificationResults = lazy(() => import("./pages/VerificationResults"));
const VerificationB = lazy(() => import("./pages/VerificationB"));
const MobileFirstGuardian = lazy(() => import("./pages/MobileFirstGuardian"));
const ProvenPatterns = lazy(() => import("./pages/ProvenPatterns"));
const ABEXPDFMaster = lazy(() => import("./pages/ABEXPDFMaster"));
const ABEXOCRMaster = lazy(() => import("./pages/ABEXOCRMaster"));
const PDFGenerationTest = lazy(() => import("./pages/admin/PDFGenerationTest"));
const PDFDemo = lazy(() => import("./pages/PDFDemo"));
const SelfTest = lazy(() => import("./pages/admin/SelfTest"));
const PDFVerificationTest = lazy(() => import("./pages/admin/PDFVerificationTest"));
const CodeReview = lazy(() => import("./pages/admin/CodeReview"));
const TestLockPdf = lazy(() => import("./pages/TestLockPdf"));
const POADiagnostics = lazy(() => import("./pages/admin/POADiagnostics"));
const BloodlineDashboardPage = lazy(() => import("./pages/admin/BloodlineDashboardPage"));
const POAOCRPage = lazy(() => import("./pages/admin/POAOCRPage"));
const SkylineBackgroundRemoval = lazy(() => import("./pages/admin/SkylineBackgroundRemoval"));
const WarsawDemo = lazy(() => import("./pages/WarsawDemo"));
const EUCelebrationDemo = lazy(() => import("./pages/EUCelebrationDemo"));
const DemosHub = lazy(() => import("./pages/DemosHub"));
const MultiStepDemo = lazy(() => import("./pages/MultiStepDemo"));
const DesignShowcase = lazy(() => import("./pages/DesignShowcase"));
const FontStylesDemo = lazy(() => import("./pages/FontStylesDemo"));
const MainCTAReference = lazy(() => import("./pages/demos/MainCTAReference"));
const ThankYouImagesDemo = lazy(() => import("./pages/ThankYouImagesDemo"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
      gcTime: 300000, // 5 minutes cache retention
    },
  },
});

// Loading fallback for admin pages
const AdminLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  const { i18n } = useTranslation();
  
  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <TooltipProvider>
            <Suspense fallback={<AdminLoader />}>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRouter>
          <Routes>
            {/* Language redirect at root */}
            <Route path="/" element={<LanguageRedirect />} />
            
            {/* Language-prefixed routes for homepage */}
            <Route path="/:lang" element={
              <LanguageSyncWrapper>
                <Index />
              </LanguageSyncWrapper>
            } />
            <Route path="/translation-demo" element={
              <Suspense fallback={<AdminLoader />}>
                <TranslationDemo />
              </Suspense>
            } />
            <Route path="/demos" element={
              <Suspense fallback={<AdminLoader />}>
                <DemosHub />
              </Suspense>
            } />
            <Route path="/hero-gallery" element={
              <Suspense fallback={<AdminLoader />}>
                <HeroGallery />
              </Suspense>
            } />
            <Route path="/demos/main-cta-reference" element={
              <Suspense fallback={<AdminLoader />}>
                <MainCTAReference />
              </Suspense>
            } />
            <Route path="/multi-step-demo" element={
              <Suspense fallback={<AdminLoader />}>
                <MultiStepDemo />
              </Suspense>
            } />
            <Route path="/font-styles-demo" element={
              <Suspense fallback={<AdminLoader />}>
                <FontStylesDemo />
              </Suspense>
            } />
            <Route path="/design-showcase" element={
              <Suspense fallback={<AdminLoader />}>
                <DesignShowcase />
              </Suspense>
            } />
            <Route path="/warsaw-demo" element={
              <Suspense fallback={<AdminLoader />}>
                <WarsawDemo />
              </Suspense>
            } />
            <Route path="/eu-celebration-demo" element={
              <Suspense fallback={<AdminLoader />}>
                <EUCelebrationDemo />
              </Suspense>
            } />
            <Route path="/thank-you-images-demo" element={
              <Suspense fallback={<AdminLoader />}>
                <ThankYouImagesDemo />
              </Suspense>
            } />
            <Route path="/contact-forms-demo" element={
              <Suspense fallback={<AdminLoader />}>
                <ContactFormsDemo />
              </Suspense>
            } />
            <Route path="/request-access" element={
              <Suspense fallback={<AdminLoader />}>
                <RequestAccess />
              </Suspense>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/cases" element={<Cases />} />
            
            {/* Portal Entry Route */}
            <Route 
              path="/portal" 
              element={
                <Suspense fallback={<AdminLoader />}>
                  <PortalIndex />
                </Suspense>
              } 
            />
            
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
            <Route
              path="/client/security"
              element={
                <Suspense fallback={<AdminLoader />}>
                  <ClientSecurity />
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
            path="/admin/cases/:id/poa-ocr"
            element={
              <Suspense fallback={<AdminLoader />}>
                <POAOCRPage />
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
            path="/admin/dropbox" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <DropboxWorkflow />
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
            path="/admin/system-overview" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <SystemOverview />
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
            path="/pdf-inspector-new" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <PDFFieldInspectorNew />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-system-verification" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PDFSystemVerification />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-verification-test" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PDFVerificationTest />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-generation-test" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PDFGenerationTest />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/code-review" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <CodeReview />
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
                <PassportWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/passport-legacy" 
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
                <ArchivesWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/archives-search-legacy"
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
                <TranslationsWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translations-legacy" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Translations />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translation-workflow-test" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <TranslationWorkflowTest />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/workflows" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AllWorkflows />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/workflow-notifications" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <WorkflowNotifications />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ai-workflow" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AIWorkflow />
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
            path="/admin/ocr-processing-monitor" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <OCRProcessingMonitor />
              </Suspense>
            } 
          />
          {/* Removed unused 3D demo routes for performance */}
          <Route 
            path="/admin/security-audit"
            element={
              <Suspense fallback={<AdminLoader />}>
                <SecurityAudit />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/researcher/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Researcher />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translator/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Translator />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/writer/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Writer />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/designer/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Designer />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/supervisor/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <Supervisor />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/role-management" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <RoleManagement />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ai-agent-diagnostics" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AIAgentDiagnostics />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/documents/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <DocumentBrowser />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-demo" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <PDFDemo />
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
            path="/admin/bloodline-dashboard/:id" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <BloodlineDashboardPage />
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
          <Route 
            path="/admin/skyline-bg-removal" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <SkylineBackgroundRemoval />
              </Suspense>
            } 
          />

          {/* AI Agents Routes */}
          <Route 
            path="/admin/ai-agents" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AIAgentsDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/agent-approvals" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AgentApprovals />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/verify-changes" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <VerifyChanges />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/verification-results" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <VerificationResults />
              </Suspense>
            } 
          />
          <Route 
            path="/verification-b" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <VerificationB />
              </Suspense>
            } 
          />
          <Route 
            path="/mobile-guardian" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <MobileFirstGuardian />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/selftest" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <SelfTest />
              </Suspense>
            } 
          />
          <Route 
            path="/test-lock-pdf" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <TestLockPdf />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/poa-diagnostics" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <POADiagnostics />
              </Suspense>
            } 
          />
          <Route 
            path="/proven-patterns" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <ProvenPatterns />
              </Suspense>
            } 
          />
          <Route 
            path="/abex-pdf-master" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <ABEXPDFMaster />
              </Suspense>
            } 
          />
          <Route 
            path="/abex-ocr-master" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <ABEXOCRMaster />
              </Suspense>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
          </Routes>
                </AppRouter>
          </BrowserRouter>
            </Suspense>
          </TooltipProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
