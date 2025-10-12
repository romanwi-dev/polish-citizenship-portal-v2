import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseStageVisualization } from "@/components/CaseStageVisualization";
import { FamilyTree } from "@/components/FamilyTree";
import { FamilyTreeInteractive } from "@/components/FamilyTreeInteractive";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { AIAgentPanel } from "@/components/AIAgentPanel";
import { 
  CheckSquare, 
  AlertCircle, 
  ArrowLeft,
  Upload,
  Edit,
  Bot,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Lazy load form components
const IntakeFormContent = lazy(() => import("./IntakeForm"));
const FamilyTreeFormContent = lazy(() => import("./FamilyTreeForm"));
const POAFormContent = lazy(() => import("./POAForm"));
const CitizenshipFormContent = lazy(() => import("./CitizenshipForm"));
const CivilRegistryFormContent = lazy(() => import("./CivilRegistryForm"));
const FamilyHistoryFormContent = lazy(() => import("./FamilyHistoryForm"));

interface CaseData {
  id: string;
  client_name: string;
  client_code: string;
  country: string;
  status: string;
  current_stage: string;
  progress: number;
  kpi_docs_percentage: number;
  kpi_tasks_completed: number;
  kpi_tasks_total: number;
  intake_completed: boolean;
  poa_approved: boolean;
  oby_filed: boolean;
  wsc_received: boolean;
  processing_mode: string;
  client_score: number;
  is_vip: boolean;
  notes: string;
  generation: string;
  created_at: string;
  updated_at: string;
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const defaultFormSection = searchParams.get('section') || 'intake';
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [intakeData, setIntakeData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadCaseData();
  }, [id]);

  const loadCaseData = async () => {
    try {
      const [caseRes, intakeRes, docsRes, tasksRes] = await Promise.all([
        supabase.from("cases").select("*").eq("id", id).single(),
        supabase.from("intake_data").select("*").eq("case_id", id).maybeSingle(),
        supabase.from("documents").select("*").eq("case_id", id),
        supabase.from("tasks").select("*").eq("case_id", id),
      ]);

      if (caseRes.error) throw caseRes.error;
      setCaseData(caseRes.data);
      setIntakeData(intakeRes.data);
      setDocuments(docsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (error) {
      console.error("Error loading case:", error);
      toast.error("Failed to load case data");
    } finally {
      setLoading(false);
    }
  };

  const handleStageActivate = async (stageId: string) => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({ current_stage: stageId })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Stage activated");
      loadCaseData();
    } catch (error) {
      console.error("Error activating stage:", error);
      toast.error("Failed to activate stage");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!caseData) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p>Case not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/cases")}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Client Info Header */}
        <div className="mb-6 relative z-10">
          <h1 className="text-3xl font-bold mb-2">{caseData.client_name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Email: {intakeData?.email || 'test@example.com'}</span>
            <span>•</span>
            <span>Updated: {new Date(caseData.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6 relative z-10" onValueChange={(value) => setSearchParams({ tab: value })}>
          <div className="w-full overflow-x-auto pb-4">
            <TabsList className="inline-flex gap-3 bg-transparent h-auto p-0 w-max">
              <TabsTrigger 
                value="edit"
                onClick={() => setShowEditDialog(true)}
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Edit
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai-agent"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <Bot className="h-4 w-4 mr-2" />
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  AI Agent
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="overview"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Overview
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="forms"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Forms
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="stage"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Stage
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Documents
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Payments
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Tasks
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="authority"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Authority
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="tree"
                className="text-lg font-bold px-12 py-4 h-auto rounded-lg bg-card/80 hover:bg-card/90 hover:shadow-[0_0_40px_hsl(221_83%_53%_/_0.4)] transition-all group relative backdrop-blur-md border border-white/30 data-[state=active]:bg-card flex-shrink-0 md:flex-1"
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Tree
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* AI AGENT TAB */}
          <TabsContent value="ai-agent" className="space-y-6">
            <AIAgentPanel caseId={id!} />
          </TabsContent>

          {/* FORMS TAB */}
          <TabsContent value="forms" className="space-y-6">
            <Tabs defaultValue={defaultFormSection} onValueChange={(value) => setSearchParams({ tab: "forms", section: value })}>
              <TabsList className="flex gap-2 bg-transparent p-0 overflow-x-auto scrollbar-hide w-full">
                <TabsTrigger value="intake" className="flex-shrink-0">
                  <span>Intake</span>
                </TabsTrigger>
                <TabsTrigger value="family-tree" className="flex-shrink-0">
                  <span>Family Tree</span>
                </TabsTrigger>
                <TabsTrigger value="family-history" className="flex-shrink-0">
                  <span>Family History</span>
                </TabsTrigger>
                <TabsTrigger value="poa" className="flex-shrink-0">
                  <span>POA</span>
                </TabsTrigger>
                <TabsTrigger value="citizenship" className="flex-shrink-0">
                  <span>Citizenship</span>
                </TabsTrigger>
                <TabsTrigger value="civil-registry" className="flex-shrink-0">
                  <span>Civil Registry</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intake" className="mt-6">
                <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <IntakeFormContent />
                </Suspense>
              </TabsContent>

              <TabsContent value="family-tree" className="mt-6">
                <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <FamilyTreeFormContent />
                </Suspense>
              </TabsContent>

              <TabsContent value="family-history" className="mt-6">
                <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <FamilyHistoryFormContent />
                </Suspense>
              </TabsContent>

              <TabsContent value="poa" className="mt-6">
                <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <POAFormContent />
                </Suspense>
              </TabsContent>

              <TabsContent value="citizenship" className="mt-6">
                <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <CitizenshipFormContent />
                </Suspense>
              </TabsContent>

              <TabsContent value="civil-registry" className="mt-6">
                <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <CivilRegistryFormContent />
                </Suspense>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* OVERVIEW TAB - Finalized from Replit */}
          <TabsContent value="overview" className="space-y-6">
            {/* Case Information */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-heading font-black">Case Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Client Name</p>
                    <p className="text-lg font-bold">{caseData.client_name}</p>
                  </div>
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Email</p>
                    <p className="text-lg font-bold">{intakeData?.email || 'test@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Current Stage</p>
                    <p className="text-lg font-bold">{caseData.current_stage?.replace('_', ' ') || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Processing Tier</p>
                    <p className="text-lg font-bold">{caseData.processing_mode?.toUpperCase() || 'STANDARD'}</p>
                  </div>
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Score</p>
                    <p className="text-lg font-bold">{caseData.client_score || 85}%</p>
                  </div>
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Age</p>
                    <p className="text-lg font-bold">
                      {Math.floor((Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                    </p>
                  </div>
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Created</p>
                    <p className="text-lg font-bold">{new Date(caseData.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-base font-label text-muted-foreground mb-1">Last Updated</p>
                    <p className="text-lg font-bold">{new Date(caseData.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stage Progress */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-heading font-black">Stage Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
                    <div className="text-base font-label text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-500 mb-2">0</div>
                    <div className="text-base font-label text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">0</div>
                    <div className="text-base font-label text-muted-foreground">Remaining</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">0</div>
                    <div className="text-base font-label text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Status */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Documents Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold mb-2">12</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-500 mb-2">12</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-500 mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Uploaded</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-500 mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Payments:</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Received:</span>
                    <span className="font-bold text-green-500">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending:</span>
                    <span className="font-bold text-yellow-500">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Not Applicable:</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-500">€0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STAGE TAB - Finalized from Replit */}
          <TabsContent value="stage">
            <CaseStageVisualization
              completedStages={[]}
              currentStage={caseData.current_stage || 'first_contact'}
              onStageActivate={handleStageActivate}
            />
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Document management - to be redesigned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Documents section will be redesigned</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS TAB */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all payments and invoices for this case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No payment records yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TASKS TAB */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Action items for this case</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUTHORITY TAB */}
          <TabsContent value="authority">
            <Card>
              <CardHeader>
                <CardTitle>Authority Panel</CardTitle>
                <CardDescription>Authority checks and compliance - to be redesigned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Authority panel will be redesigned</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TREE TAB */}
          <TabsContent value="tree">
            {intakeData ? (
              <FamilyTreeInteractive
                clientData={{
                  firstName: intakeData.first_name || '',
                  lastName: intakeData.last_name || '',
                  maidenName: intakeData.maiden_name,
                  dateOfBirth: intakeData.date_of_birth,
                  placeOfBirth: intakeData.place_of_birth,
                  sex: intakeData.sex,
                  documents: {
                    birthCertificate: true,
                    marriageCertificate: false,
                    passport: true,
                  }
                }}
                spouse={{
                  firstName: "",
                  lastName: "",
                  documents: {
                    birthCertificate: false,
                    marriageCertificate: false,
                    passport: false,
                  }
                }}
                father={intakeData.father_first_name ? {
                  firstName: intakeData.father_first_name,
                  lastName: intakeData.father_last_name || '',
                  dateOfBirth: intakeData.father_dob,
                  placeOfBirth: intakeData.father_pob,
                  documents: {
                    birthCertificate: true,
                    marriageCertificate: true,
                    passport: false,
                  }
                } : undefined}
                mother={intakeData.mother_first_name ? {
                  firstName: intakeData.mother_first_name,
                  lastName: intakeData.mother_last_name || '',
                  maidenName: intakeData.mother_maiden_name,
                  dateOfBirth: intakeData.mother_dob,
                  placeOfBirth: intakeData.mother_pob,
                  documents: {
                    birthCertificate: true,
                    marriageCertificate: true,
                    passport: true,
                  }
                } : undefined}
                paternalGrandfather={intakeData.pgf_first_name ? {
                  firstName: intakeData.pgf_first_name,
                  lastName: intakeData.pgf_last_name || '',
                  dateOfBirth: intakeData.pgf_dob,
                  placeOfBirth: intakeData.pgf_pob,
                  documents: {
                    birthCertificate: false,
                    marriageCertificate: true,
                    passport: false,
                  }
                } : undefined}
                paternalGrandmother={intakeData.pgm_first_name ? {
                  firstName: intakeData.pgm_first_name,
                  lastName: intakeData.pgm_last_name || '',
                  maidenName: intakeData.pgm_maiden_name,
                  dateOfBirth: intakeData.pgm_dob,
                  placeOfBirth: intakeData.pgm_pob,
                  documents: {
                    birthCertificate: false,
                    marriageCertificate: true,
                    passport: false,
                  }
                } : undefined}
                maternalGrandfather={intakeData.mgf_first_name ? {
                  firstName: intakeData.mgf_first_name,
                  lastName: intakeData.mgf_last_name || '',
                  dateOfBirth: intakeData.mgf_dob,
                  placeOfBirth: intakeData.mgf_pob,
                  documents: {
                    birthCertificate: true,
                    marriageCertificate: false,
                    passport: false,
                  }
                } : undefined}
                maternalGrandmother={intakeData.mgm_first_name ? {
                  firstName: intakeData.mgm_first_name,
                  lastName: intakeData.mgm_last_name || '',
                  maidenName: intakeData.mgm_maiden_name,
                  dateOfBirth: intakeData.mgm_dob,
                  placeOfBirth: intakeData.mgm_pob,
                  documents: {
                    birthCertificate: true,
                    marriageCertificate: false,
                    passport: true,
                  }
                } : undefined}
                onEdit={(personType) => {
                  // Navigate to family tree form
                  navigate(`/admin/cases/${id}/family-tree`);
                }}
                onOpenMasterTable={() => navigate(`/admin/cases/${id}/family-tree`)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Family Tree</CardTitle>
                  <CardDescription>No family data available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Complete the intake form to populate family tree data</p>
                    <Button onClick={() => navigate(`/admin/cases/${id}/family-tree`)} className="mt-4">
                      Go to Family Tree
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {caseData && showEditDialog && (
        <EditCaseDialog
          caseData={{
            id: caseData.id,
            name: caseData.client_name,
            client_code: caseData.client_code,
            country: caseData.country || '',
            status: caseData.status,
            generation: caseData.processing_mode,
            is_vip: caseData.is_vip,
            notes: caseData.notes || '',
            progress: caseData.progress,
          }}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUpdate={() => {
            loadCaseData();
            setShowEditDialog(false);
          }}
        />
      )}

    </AdminLayout>
  );
}
