import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  CheckSquare, 
  Mail, 
  AlertCircle, 
  ArrowLeft,
  Upload,
  Download,
  Eye
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

  return (
    <AdminLayout>
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/cases")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{caseData.client_name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{caseData.client_code}</Badge>
              <Badge>{caseData.current_stage.replace("_", " ").toUpperCase()}</Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold mb-2">{caseData.progress}%</div>
            <Progress value={caseData.progress} className="w-32" />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Documents</span>
              </div>
              <div className="text-2xl font-bold">{caseData.kpi_docs_percentage}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tasks</span>
              </div>
              <div className="text-2xl font-bold">
                {caseData.kpi_tasks_completed}/{caseData.kpi_tasks_total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge variant={caseData.intake_completed ? "default" : "secondary"}>
                {caseData.intake_completed ? "Intake Done" : "Pending"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">POA</span>
              </div>
              <Badge variant={caseData.poa_approved ? "default" : "secondary"}>
                {caseData.poa_approved ? "Approved" : "Pending"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="intake" className="space-y-4">
          <TabsList>
            <TabsTrigger value="intake">Intake Data</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="poa">POA</TabsTrigger>
            <TabsTrigger value="oby">OBY Form</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

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
