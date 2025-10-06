import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseStageVisualization } from "@/components/CaseStageVisualization";
import { 
  CheckSquare, 
  AlertCircle, 
  ArrowLeft,
  Upload,
  Edit
} from "lucide-react";
import { toast } from "sonner";

interface CaseData {
  id: string;
  client_name: string;
  client_code: string;
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
  created_at: string;
  updated_at: string;
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [intakeData, setIntakeData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/cases")}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Client Info Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{caseData.client_name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Email: {intakeData?.email || 'test@example.com'}</span>
            <span>•</span>
            <span>Updated: {new Date(caseData.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-12 items-center justify-start bg-transparent border-b border-border w-full">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="stage"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6"
              >
                Stage
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6"
              >
                Payments
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="authority"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6"
              >
                Authority
              </TabsTrigger>
              <TabsTrigger 
                value="tree"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6"
              >
                Tree
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* OVERVIEW TAB - Finalized from Replit */}
          <TabsContent value="overview" className="space-y-6">
            {/* Case Information */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                    <p className="font-semibold">{caseData.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-semibold">{intakeData?.email || 'test@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Stage</p>
                    <p className="font-semibold">{caseData.current_stage?.replace('_', ' ') || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Processing Tier</p>
                    <p className="font-semibold">{caseData.processing_mode?.toUpperCase() || 'STANDARD'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Score</p>
                    <p className="font-semibold">{caseData.client_score || 85}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Age</p>
                    <p className="font-semibold">
                      {Math.floor((Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="font-semibold">{new Date(caseData.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                    <p className="font-semibold">{new Date(caseData.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stage Progress */}
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Stage Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-500 mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Total</div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Family Tree Template', 'POA Citizenship (Married)', 'POA Citizenship (Single)', 'POA Citizenship (Minor)', 
                'Citizenship Application Form', 'Citizenship Application (Alt)', 'Foreign Act Registration', 'Civil Records Completion',
                'Civil Records Correction', 'Civil Records Copy Request', 'Passport & ID Documents', 'Supporting Documents'].map((doc) => (
                <Card key={doc} className="p-4 bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm line-clamp-2">{doc}</h4>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                </Card>
              ))}
            </div>
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
            <Card className="p-6 bg-card/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Checks Authority Panel (CAP)</h3>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Re-run Checks
                </Button>
              </div>

              <div className="mb-6 p-4 bg-card rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Rules: 6 • Warnings: 0 • Blockers: 1 • Can proceed: No
                </div>
                <div className="text-xs text-muted-foreground">
                  Last evaluated: {new Date().toLocaleString()}
                </div>
              </div>

              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-500 text-white">BLOCKER</Badge>
                        </div>
                        <h4 className="font-semibold mb-1">Family tree data missing</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete family tree is required for Polish citizenship application
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Fix
                      </Button>
                      <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Override
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Card>
          </TabsContent>

          {/* TREE TAB */}
          <TabsContent value="tree">
            <Card>
              <CardHeader>
                <CardTitle>Family Tree</CardTitle>
                <CardDescription>Interactive family tree visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Family tree visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
