import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CaseStageVisualization } from "@/components/CaseStageVisualization";
import { 
  FileText, 
  CheckSquare, 
  Mail, 
  AlertCircle, 
  ArrowLeft,
  Upload,
  Download,
  Eye,
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

  const handleGeneratePOA = async (poaType: 'adult' | 'minor' | 'spouse') => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-poa', {
        body: { caseId: id, poaType }
      });

      if (error) throw error;
      toast.success("POA generated successfully");
      loadCaseData();
    } catch (error) {
      console.error("Error generating POA:", error);
      toast.error("Failed to generate POA");
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/cases")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{caseData.client_name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Email: test@example.com</span>
            <span>•</span>
            <span>Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="bg-card/50 p-1 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="stage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Stage
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Documents
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Payments
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="authority" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Authority
            </TabsTrigger>
            <TabsTrigger value="tree" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Tree
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
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
                    <p className="font-semibold">test@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Stage</p>
                    <p className="font-semibold">Pending</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Processing Tier</p>
                    <p className="font-semibold">STANDARD</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Score</p>
                    <p className="font-semibold">85%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Age</p>
                    <p className="font-semibold">1 months</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">0</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">12</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">0</div>
                    <div className="text-sm text-muted-foreground">Uploaded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">0</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
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

          <TabsContent value="stage">
            <CaseStageVisualization
              completedStages={[]}
              currentStage={caseData.current_stage || 'first_contact'}
              onStageActivate={handleStageActivate}
            />
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid grid-cols-4 gap-4">
              {['Family Tree Template', 'POA Citizenship (Married)', 'POA Citizenship (Single)', 'POA Citizenship (Minor)', 
                'Citizenship Application Form', 'Citizenship Application (Alt)', 'Foreign Act Registration', 'Civil Records Completion',
                'Civil Records Correction', 'Civil Records Copy Request', 'Passport & ID Documents', 'Supporting Documents'].map((doc) => (
                <Card key={doc} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{doc}</h4>
                    <Button size="sm" variant="ghost">
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
                      <Button size="sm" variant="outline" className="border-orange-500 text-orange-500">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Override
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Card>
          </TabsContent>

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

          <TabsContent value="intake">
            <Card>
              <CardHeader>
                <CardTitle>Intake Information</CardTitle>
                <CardDescription>
                  Client information collected during intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intakeData ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-sm">{intakeData.first_name} {intakeData.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="text-sm">{intakeData.date_of_birth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Passport Number</p>
                      <p className="text-sm">{intakeData.passport_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{intakeData.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion</p>
                      <Progress value={intakeData.completion_percentage || 0} className="mt-2" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No intake data yet</p>
                    <Button className="mt-4" onClick={() => navigate(`/admin/cases/${id}/intake`)}>
                      Start Intake
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Case documents and files</CardDescription>
                  </div>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.category || "Uncategorized"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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

          <TabsContent value="poa">
            <Card>
              <CardHeader>
                <CardTitle>Power of Attorney</CardTitle>
                <CardDescription>Generate and manage POA documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button onClick={() => handleGeneratePOA('adult')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Adult POA
                    </Button>
                    <Button onClick={() => handleGeneratePOA('minor')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Minor POA
                    </Button>
                    <Button onClick={() => handleGeneratePOA('spouse')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Spouse POA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="oby">
            <Card>
              <CardHeader>
                <CardTitle>OBY Form (156 Fields)</CardTitle>
                <CardDescription>Polish citizenship application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>OBY form management coming soon</p>
                  <p className="text-sm mt-2">156 fields auto-populated from intake data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
                <CardDescription>Case progress and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                    <div>
                      <p className="font-medium">Case Created</p>
                      <p className="text-sm text-muted-foreground">Lead status</p>
                    </div>
                  </div>
                  {caseData.intake_completed && (
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                      <div>
                        <p className="font-medium">Intake Completed</p>
                        <p className="text-sm text-muted-foreground">All client data collected</p>
                      </div>
                    </div>
                  )}
                  {caseData.poa_approved && (
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                      <div>
                        <p className="font-medium">POA Approved</p>
                        <p className="text-sm text-muted-foreground">HAC approved power of attorney</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
