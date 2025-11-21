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
                  <Route path="/translation-demo" element={<TranslationDemo />} />
                  <Route path="/demos" element={<DemosHub />} />
                  <Route path="/hero-gallery" element={<HeroGallery />} />
                  <Route path="/demos/main-cta-reference" element={<MainCTAReference />} />
                  <Route path="/multi-step-demo" element={<MultiStepDemo />} />
                  <Route path="/font-styles-demo" element={<FontStylesDemo />} />
                  <Route path="/design-showcase" element={<DesignShowcase />} />
                  <Route path="/warsaw-demo" element={<WarsawDemo />} />
                  <Route path="/eu-celebration-demo" element={<EUCelebrationDemo />} />
                  <Route path="/thank-you-images-demo" element={<ThankYouImagesDemo />} />
                  <Route path="/contact-forms-demo" element={<ContactFormsDemo />} />
                  <Route path="/request-access" element={<RequestAccess />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cases" element={<Cases />} />
                  
                  {/* Portal Entry Route */}
                  <Route path="/portal" element={<PortalIndex />} />
                  
                  {/* Client Portal Routes */}
                  <Route path="/client/login" element={<ClientLogin />} />
                  <Route path="/client/dashboard/:caseId" element={<ClientDashboard />} />
                  <Route path="/client/intake/:token" element={<ClientIntakeWizard />} />
                  <Route path="/client/security" element={<ClientSecurity />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/cases" element={<CasesManagement />} />
                  <Route path="/admin/cases/new" element={<NewCase />} />
                  <Route path="/admin/cases/:id" element={<CaseDetail />} />
                  <Route path="/admin/cases/:id/poa-ocr" element={<POAOCRPage />} />
                  <Route path="/admin/cases/:id/additional-data" element={<AdditionalData />} />
                  <Route path="/admin/intake-demo" element={<IntakeDemo />} />
                  <Route path="/admin/form-scanner" element={<FormScanner />} />
                  <Route path="/admin/qa-harness" element={<QAHarness />} />
                  <Route path="/admin/dropbox-migration" element={<DropboxMigration />} />
                  <Route path="/admin/dropbox" element={<DropboxWorkflow />} />
                  <Route path="/admin/cases/:id/authority-review" element={<AuthorityReview />} />
                  <Route path="/admin/system-health" element={<SystemHealth />} />
                  <Route path="/admin/system-overview" element={<SystemOverview />} />
                  <Route path="/admin/pdf-inspector" element={<PDFInspector />} />
                  <Route path="/admin/pdf-field-inspector" element={<PDFFieldInspector />} />
                  <Route path="/pdf-inspector-new" element={<PDFFieldInspectorNew />} />
                  <Route path="/admin/pdf-system-verification" element={<PDFSystemVerification />} />
                  <Route path="/admin/pdf-verification-test" element={<PDFVerificationTest />} />
                  <Route path="/admin/pdf-generation-test" element={<PDFGenerationTest />} />
                  <Route path="/admin/code-review" element={<CodeReview />} />
                  <Route path="/admin/zero-errors-checklist" element={<ZeroErrorsChecklist />} />
                  <Route path="/admin/upload-pdf-templates" element={<UploadPDFTemplates />} />
                  <Route path="/admin/manual-pdf-upload" element={<ManualPDFUpload />} />
                  <Route path="/admin/citizenship-field-review" element={<CitizenshipFieldReview />} />
                  <Route path="/admin/big-plan-tracker" element={<BigPlanTracker />} />
                  <Route path="/admin/testing-dashboard" element={<TestingDashboard />} />
                  <Route path="/admin/forms-demo" element={<FormsDemo />} />
                  <Route path="/admin/documents-collection/:id" element={<DocumentsCollection />} />
                  <Route path="/admin/civil-acts" element={<PolishCivilActs />} />
                  <Route path="/admin/citizenship" element={<PolishCitizenship />} />
                  <Route path="/admin/passport" element={<PassportWorkflow />} />
                  <Route path="/admin/passport-legacy" element={<PolishPassport />} />
                  <Route path="/admin/archives-search" element={<ArchivesWorkflow />} />
                  <Route path="/admin/archives-search-legacy" element={<ArchivesSearch />} />
                  <Route path="/admin/translations" element={<TranslationsWorkflow />} />
                  <Route path="/admin/translations-legacy" element={<Translations />} />
                  <Route path="/admin/translation-workflow-test" element={<TranslationWorkflowTest />} />
                  <Route path="/admin/workflows" element={<AllWorkflows />} />
                  <Route path="/admin/workflow-notifications" element={<WorkflowNotifications />} />
                  <Route path="/admin/ai-workflow" element={<AIWorkflow />} />
                  <Route path="/admin/extended-services" element={<ExtendedServices />} />
                  <Route path="/admin/ocr-review" element={<OCRReview />} />
                  <Route path="/admin/ocr-processing-monitor" element={<OCRProcessingMonitor />} />
                  <Route path="/admin/security-audit" element={<SecurityAudit />} />
                  <Route path="/admin/researcher/:id" element={<Researcher />} />
                  <Route path="/admin/translator/:id" element={<Translator />} />
                  <Route path="/admin/writer/:id" element={<Writer />} />
                  <Route path="/admin/designer/:id" element={<Designer />} />
                  <Route path="/admin/supervisor/:id" element={<Supervisor />} />
                  <Route path="/admin/role-management" element={<RoleManagement />} />
                  <Route path="/admin/ai-agent-diagnostics" element={<AIAgentDiagnostics />} />
                  <Route path="/admin/documents/:id" element={<DocumentBrowser />} />
                  <Route path="/admin/pdf-demo" element={<PDFDemo />} />
                  
                  {/* Form Routes */}
                  <Route path="/admin/intake/:id" element={<IntakeForm />} />
                  <Route path="/admin/family-tree/:id" element={<FamilyTreeForm />} />
                  <Route path="/admin/family-tree-view/:id" element={<FamilyTreePage />} />
                  <Route path="/admin/bloodline-dashboard/:id" element={<BloodlineDashboardPage />} />
                  <Route path="/admin/family-history/:id" element={<FamilyHistoryForm />} />
                  <Route path="/admin/poa/:id" element={<POAForm />} />
                  <Route path="/admin/citizenship/:id" element={<CitizenshipForm />} />
                  <Route path="/admin/civil-registry/:id" element={<CivilRegistryForm />} />
                  <Route path="/admin/skyline-bg-removal" element={<SkylineBackgroundRemoval />} />

                  {/* AI Agents Routes */}
                  <Route path="/admin/ai-agents" element={<AIAgentsDashboard />} />
                  <Route path="/admin/agent-approvals" element={<AgentApprovals />} />
                  <Route path="/admin/verify-changes" element={<VerifyChanges />} />
                  <Route path="/admin/verification-results" element={<VerificationResults />} />
                  <Route path="/verification-b" element={<VerificationB />} />
                  <Route path="/phase-b" element={<PhaseBVerification />} />
                  <Route path="/mobile-guardian" element={<MobileFirstGuardian />} />
                  <Route path="/admin/selftest" element={<SelfTest />} />
                  <Route path="/test-lock-pdf" element={<TestLockPdf />} />
                  <Route path="/admin/poa-diagnostics" element={<POADiagnostics />} />
                  <Route path="/proven-patterns" element={<ProvenPatterns />} />
                  <Route path="/abex-pdf" element={<ABEXPDFMaster />} />
                  <Route path="/abex-ocr" element={<ABEXOCRMaster />} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppRouter>
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
