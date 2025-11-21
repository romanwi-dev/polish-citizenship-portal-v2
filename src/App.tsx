import { useEffect } from "react";
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
import ContactFormsDemo from "./pages/ContactFormsDemo";
import TranslationDemo from "./pages/TranslationDemo";
import HeroGallery from "./pages/HeroGallery";

import PortalIndex from "./pages/PortalIndex";
import ClientLogin from "./pages/ClientLogin";
import ClientDashboard from "./pages/ClientDashboard";
import ClientSecurity from "./pages/ClientSecurity";
import ClientIntakeWizard from "./pages/ClientIntakeWizard";
import RequestAccess from "./pages/RequestAccess";

import Dashboard from "./pages/admin/Dashboard";
import CasesManagement from "./pages/admin/CasesManagement";
import NewCase from "./pages/admin/NewCase";
import CaseDetail from "./pages/admin/CaseDetail";
import AdditionalData from "./pages/admin/AdditionalData";
import FamilyTreeForm from "./pages/admin/FamilyTreeForm";
import FamilyTreePage from "./pages/admin/FamilyTreePage";
import FamilyHistoryForm from "./pages/admin/FamilyHistoryForm";
import POAForm from "./pages/admin/POAForm";
import CitizenshipForm from "./pages/admin/CitizenshipForm";
import CivilRegistryForm from "./pages/admin/CivilRegistryForm";
import IntakeForm from "./pages/admin/IntakeForm";
import IntakeDemo from "./pages/admin/IntakeDemo";
import FormScanner from "./pages/admin/FormScanner";
import QAHarness from "./pages/admin/QAHarness";
import DropboxMigration from "./pages/admin/DropboxMigration";
import AuthorityReview from "./pages/admin/AuthorityReview";
import SystemHealth from "./pages/admin/SystemHealth";
import PDFInspector from "./pages/admin/PDFInspector";
import PDFFieldInspector from "./pages/admin/PDFFieldInspector";
import PDFSystemVerification from "./pages/admin/PDFSystemVerification";
import PDFFieldInspectorNew from "./pages/PDFFieldInspector";
import ZeroErrorsChecklist from "./pages/admin/ZeroErrorsChecklist";
import UploadPDFTemplates from "./pages/admin/UploadPDFTemplates";
import ManualPDFUpload from "./pages/admin/ManualPDFUpload";
import CitizenshipFieldReview from "./pages/admin/CitizenshipFieldReview";
import BigPlanTracker from "./pages/admin/BigPlanTracker";
import TestingDashboard from "./pages/admin/TestingDashboard";
import FormsDemo from "./pages/admin/FormsDemo";
import Translations from "./pages/admin/Translations";
import ArchivesSearch from "./pages/admin/ArchivesSearch";
import TranslationsWorkflow from "./pages/admin/TranslationsWorkflow";
import ArchivesWorkflow from "./pages/admin/ArchivesWorkflow";
import PassportWorkflow from "./pages/admin/PassportWorkflow";
import DropboxWorkflow from "./pages/admin/DropboxWorkflow";
import AllWorkflows from "./pages/admin/AllWorkflows";
import WorkflowNotifications from "./pages/admin/WorkflowNotifications";
import AIWorkflow from "./pages/admin/AIWorkflow";
import TranslationWorkflowTest from "./pages/admin/TranslationWorkflowTest";
import DocumentsCollection from "./pages/admin/DocumentsCollection";
import PolishCivilActs from "./pages/admin/PolishCivilActs";
import PolishCitizenship from "./pages/admin/PolishCitizenship";
import PolishPassport from "./pages/admin/PolishPassport";
import ExtendedServices from "./pages/admin/ExtendedServices";
import OCRReview from "./pages/admin/OCRReview";
import DocumentBrowser from "./pages/admin/DocumentBrowser";
import SecurityAudit from "./pages/admin/SecurityAudit";
import Researcher from "./pages/admin/Researcher";
import Translator from "./pages/admin/Translator";
import Writer from "./pages/admin/Writer";
import Designer from "./pages/admin/Designer";
import Supervisor from "./pages/admin/Supervisor";
import OCRProcessingMonitor from "./pages/admin/OCRProcessingMonitor";
import AIAgentDiagnostics from "./pages/admin/AIAgentDiagnostics";
import RoleManagement from "./pages/admin/RoleManagement";
import SystemOverview from "./pages/admin/SystemOverview";
import AIAgentsDashboard from "./pages/admin/AIAgentsDashboard";
import AgentApprovals from "./pages/admin/AgentApprovals";
import VerifyChanges from "./pages/VerifyChanges";
import VerificationResults from "./pages/VerificationResults";
import VerificationB from "./pages/VerificationB";
import PhaseBVerification from "./pages/PhaseBVerification";
import MobileFirstGuardian from "./pages/MobileFirstGuardian";
import ProvenPatterns from "./pages/ProvenPatterns";
import ABEXPDFMaster from "./pages/ABEXPDFMaster";
import ABEXOCRMaster from "./pages/ABEXOCRMaster";
import PDFGenerationTest from "./pages/admin/PDFGenerationTest";
import PDFDemo from "./pages/PDFDemo";
import SelfTest from "./pages/admin/SelfTest";
import PDFVerificationTest from "./pages/admin/PDFVerificationTest";
import CodeReview from "./pages/admin/CodeReview";
import TestLockPdf from "./pages/TestLockPdf";
import POADiagnostics from "./pages/admin/POADiagnostics";
import BloodlineDashboardPage from "./pages/admin/BloodlineDashboardPage";
import POAOCRPage from "./pages/admin/POAOCRPage";
import SkylineBackgroundRemoval from "./pages/admin/SkylineBackgroundRemoval";
import WarsawDemo from "./pages/WarsawDemo";
import EUCelebrationDemo from "./pages/EUCelebrationDemo";
import DemosHub from "./pages/DemosHub";
import MultiStepDemo from "./pages/MultiStepDemo";
import DesignShowcase from "./pages/DesignShowcase";
import FontStylesDemo from "./pages/FontStylesDemo";
import MainCTAReference from "./pages/demos/MainCTAReference";
import ThankYouImagesDemo from "./pages/ThankYouImagesDemo";


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


const App = () => {
  const { i18n } = useTranslation();
  
  // Update HTML lang and dir attributes when language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    // Set RTL for Hebrew
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, [i18n.language]);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <TooltipProvider>
            <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
                <TranslationDemo />
              </Suspense>
            } />
            <Route path="/demos" element={
              <Suspense fallback={<PageLoader />}>
                <DemosHub />
              </Suspense>
            } />
            <Route path="/hero-gallery" element={
              <Suspense fallback={<PageLoader />}>
                <HeroGallery />
              </Suspense>
            } />
            <Route path="/demos/main-cta-reference" element={
              <Suspense fallback={<PageLoader />}>
                <MainCTAReference />
              </Suspense>
            } />
            <Route path="/multi-step-demo" element={
              <Suspense fallback={<PageLoader />}>
                <MultiStepDemo />
              </Suspense>
            } />
            <Route path="/font-styles-demo" element={
              <Suspense fallback={<PageLoader />}>
                <FontStylesDemo />
              </Suspense>
            } />
            <Route path="/design-showcase" element={
              <Suspense fallback={<PageLoader />}>
                <DesignShowcase />
              </Suspense>
            } />
            <Route path="/warsaw-demo" element={
              <Suspense fallback={<PageLoader />}>
                <WarsawDemo />
              </Suspense>
            } />
            <Route path="/eu-celebration-demo" element={
              <Suspense fallback={<PageLoader />}>
                <EUCelebrationDemo />
              </Suspense>
            } />
            <Route path="/thank-you-images-demo" element={
              <Suspense fallback={<PageLoader />}>
                <ThankYouImagesDemo />
              </Suspense>
            } />
            <Route path="/contact-forms-demo" element={
              <Suspense fallback={<PageLoader />}>
                <ContactFormsDemo />
              </Suspense>
            } />
            <Route path="/request-access" element={
              <Suspense fallback={<PageLoader />}>
                <RequestAccess />
              </Suspense>
            } />
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/cases" element={
              <Suspense fallback={<PageLoader />}>
                <Cases />
              </Suspense>
            } />
            
            {/* Portal Entry Route */}
            <Route 
              path="/portal" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <PortalIndex />
                </Suspense>
              } 
            />
            
            {/* Client Portal Routes */}
            <Route 
              path="/client/login"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClientLogin />
                </Suspense>
              } 
            />
            <Route
              path="/client/dashboard/:caseId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClientDashboard />
                </Suspense>
              }
            />
            <Route
              path="/client/intake/:token"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClientIntakeWizard />
                </Suspense>
              }
            />
            <Route
              path="/client/security"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClientSecurity />
                </Suspense>
              }
            />
          {/* Admin Routes - Lazy Loaded */}
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases" 
            element={
              <Suspense fallback={<PageLoader />}>
                <CasesManagement />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases/new" 
            element={
              <Suspense fallback={<PageLoader />}>
                <NewCase />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <CaseDetail />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases/:id/poa-ocr"
            element={
              <Suspense fallback={<PageLoader />}>
                <POAOCRPage />
              </Suspense>
            } 
          />
          <Route
            path="/admin/cases/:id/additional-data"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdditionalData />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/intake-demo" 
            element={
              <Suspense fallback={<PageLoader />}>
                <IntakeDemo />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/form-scanner"
            element={
              <Suspense fallback={<PageLoader />}>
                <FormScanner />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/qa-harness" 
            element={
              <Suspense fallback={<PageLoader />}>
                <QAHarness />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/dropbox-migration" 
            element={
              <Suspense fallback={<PageLoader />}>
                <DropboxMigration />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/dropbox" 
            element={
              <Suspense fallback={<PageLoader />}>
                <DropboxWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/cases/:id/authority-review" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AuthorityReview />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/system-health" 
            element={
              <Suspense fallback={<PageLoader />}>
                <SystemHealth />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/system-overview" 
            element={
              <Suspense fallback={<PageLoader />}>
                <SystemOverview />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-inspector" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PDFInspector />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-field-inspector" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PDFFieldInspector />
              </Suspense>
            } 
          />
          <Route 
            path="/pdf-inspector-new" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PDFFieldInspectorNew />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-system-verification" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PDFSystemVerification />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-verification-test" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PDFVerificationTest />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-generation-test" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PDFGenerationTest />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/code-review" 
            element={
              <Suspense fallback={<PageLoader />}>
                <CodeReview />
              </Suspense>
            } 
          />
          <Route
            path="/admin/zero-errors-checklist" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ZeroErrorsChecklist />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/upload-pdf-templates" 
            element={
              <Suspense fallback={<PageLoader />}>
                <UploadPDFTemplates />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/manual-pdf-upload" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ManualPDFUpload />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/citizenship-field-review" 
            element={
              <Suspense fallback={<PageLoader />}>
                <CitizenshipFieldReview />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/big-plan-tracker" 
            element={
              <Suspense fallback={<PageLoader />}>
                <BigPlanTracker />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/testing-dashboard" 
            element={
              <Suspense fallback={<PageLoader />}>
                <TestingDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/forms-demo" 
            element={
              <Suspense fallback={<PageLoader />}>
                <FormsDemo />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/documents-collection/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <DocumentsCollection />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/civil-acts" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PolishCivilActs />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/citizenship" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PolishCitizenship />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/passport" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PassportWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/passport-legacy" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PolishPassport />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/archives-search"
            element={
              <Suspense fallback={<PageLoader />}>
                <ArchivesWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/archives-search-legacy"
            element={
              <Suspense fallback={<PageLoader />}>
                <ArchivesSearch />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translations" 
            element={
              <Suspense fallback={<PageLoader />}>
                <TranslationsWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translations-legacy" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Translations />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translation-workflow-test" 
            element={
              <Suspense fallback={<PageLoader />}>
                <TranslationWorkflowTest />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/workflows" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AllWorkflows />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/workflow-notifications" 
            element={
              <Suspense fallback={<PageLoader />}>
                <WorkflowNotifications />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ai-workflow" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AIWorkflow />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/extended-services" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ExtendedServices />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ocr-review" 
            element={
              <Suspense fallback={<PageLoader />}>
                <OCRReview />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ocr-processing-monitor" 
            element={
              <Suspense fallback={<PageLoader />}>
                <OCRProcessingMonitor />
              </Suspense>
            } 
          />
          {/* Removed unused 3D demo routes for performance */}
          <Route 
            path="/admin/security-audit"
            element={
              <Suspense fallback={<PageLoader />}>
                <SecurityAudit />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/researcher/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Researcher />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/translator/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Translator />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/writer/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Writer />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/designer/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Designer />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/supervisor/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Supervisor />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/role-management" 
            element={
              <Suspense fallback={<PageLoader />}>
                <RoleManagement />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/ai-agent-diagnostics" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AIAgentDiagnostics />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/documents/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <DocumentBrowser />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/pdf-demo" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PDFDemo />
              </Suspense>
            } 
          />
          
          
          {/* Form Routes */}
          <Route 
            path="/admin/intake/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <IntakeForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/family-tree/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <FamilyTreeForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/family-tree-view/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <FamilyTreePage />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/bloodline-dashboard/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <BloodlineDashboardPage />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/family-history/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <FamilyHistoryForm />
              </Suspense>
            }
          />
          <Route 
            path="/admin/poa/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <POAForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/citizenship/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <CitizenshipForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/civil-registry/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <CivilRegistryForm />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/skyline-bg-removal" 
            element={
              <Suspense fallback={<PageLoader />}>
                <SkylineBackgroundRemoval />
              </Suspense>
            } 
          />

          {/* AI Agents Routes */}
          <Route 
            path="/admin/ai-agents" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AIAgentsDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/agent-approvals" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AgentApprovals />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/verify-changes" 
            element={
              <Suspense fallback={<PageLoader />}>
                <VerifyChanges />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/verification-results" 
            element={
              <Suspense fallback={<PageLoader />}>
                <VerificationResults />
              </Suspense>
            } 
          />
          <Route 
            path="/verification-b" 
            element={
              <Suspense fallback={<PageLoader />}>
                <VerificationB />
              </Suspense>
            } 
          />
          <Route 
            path="/phase-b" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PhaseBVerification />
              </Suspense>
            } 
          />
          <Route 
            path="/mobile-guardian" 
            element={
              <Suspense fallback={<PageLoader />}>
                <MobileFirstGuardian />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/selftest" 
            element={
              <Suspense fallback={<PageLoader />}>
                <SelfTest />
              </Suspense>
            } 
          />
          <Route 
            path="/test-lock-pdf" 
            element={
              <Suspense fallback={<PageLoader />}>
                <TestLockPdf />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/poa-diagnostics" 
            element={
              <Suspense fallback={<PageLoader />}>
                <POADiagnostics />
              </Suspense>
            } 
          />
          <Route 
            path="/proven-patterns" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ProvenPatterns />
              </Suspense>
            } 
          />
          <Route 
            path="/abex-pdf-master" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ABEXPDFMaster />
              </Suspense>
            } 
          />
          <Route 
            path="/abex-ocr-master" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ABEXOCRMaster />
              </Suspense>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          } />
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
