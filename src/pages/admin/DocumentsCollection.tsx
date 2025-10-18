import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  FileText, 
  Languages, 
  Archive, 
  FileCheck, 
  AlertCircle,
  Plus,
  CheckCircle2
} from "lucide-react";
import { DocRadarPanel } from "@/components/DocRadarPanel";
import { ArchiveRequestGenerator } from "@/components/ArchiveRequestGenerator";

export default function DocumentsCollection() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [masterData, setMasterData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [caseRes, masterRes, docsRes, tasksRes] = await Promise.all([
        supabase.from("cases").select("*").eq("id", id).single(),
        supabase.from("master_table").select("*").eq("case_id", id).maybeSingle(),
        supabase.from("documents").select("*").eq("case_id", id),
        supabase.from("tasks").select("*").eq("case_id", id).eq("task_type", "translation"),
      ]);

      if (caseRes.error) throw caseRes.error;
      
      setCaseData(caseRes.data);
      setMasterData(masterRes.data);
      setDocuments(docsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load document data");
    } finally {
      setLoading(false);
    }
  };

  const createTranslationTask = async (docId: string, docName: string, personType: string) => {
    try {
      const { error } = await supabase.from("tasks").insert({
        case_id: id,
        task_type: "translation",
        title: `Translate ${docName}`,
        description: `Document needs certified Polish translation for ${personType}`,
        priority: "high",
        status: "pending",
        related_document_id: docId,
        related_person: personType,
        metadata: {
          document_name: docName,
          person_type: personType,
        },
      });

      if (error) throw error;
      toast.success("Translation task created");
      loadData();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error("Failed to create translation task");
    }
  };

  const createUSCTask = async (type: 'umiejscowienie' | 'uzupelnienie', personType: string) => {
    try {
      const taskTitles = {
        umiejscowienie: 'USC Umiejscowienie Request',
        uzupelnienie: 'USC Uzupełnienie Request',
      };

      const { error } = await supabase.from("tasks").insert({
        case_id: id,
        task_type: "usc_workflow",
        title: taskTitles[type],
        description: `Generate ${type} request for Polish Civil Registry for ${personType}`,
        priority: "medium",
        status: "pending",
        related_person: personType,
        metadata: {
          usc_type: type,
          person_type: personType,
        },
      });

      if (error) throw error;
      toast.success(`${type} task created`);
      loadData();
    } catch (error: any) {
      console.error("Error creating USC task:", error);
      toast.error("Failed to create USC task");
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

  const translationNeeded = documents.filter(d => !d.is_translated && d.translation_required);
  const uscWorkflows = tasks.filter((t: any) => t.task_type === "usc_workflow");

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-black mb-2">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Documents Engine
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Case: {caseData?.client_name} ({caseData?.client_code})
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-3xl font-bold">{documents.length}</p>
                </div>
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Need Translation</p>
                  <p className="text-3xl font-bold text-orange-600">{translationNeeded.length}</p>
                </div>
                <Languages className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">USC Workflows</p>
                  <p className="text-3xl font-bold text-blue-600">{uscWorkflows.length}</p>
                </div>
                <Archive className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Docs</p>
                  <p className="text-3xl font-bold text-green-600">
                    {documents.filter(d => d.is_verified).length}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="radar" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="radar">Doc Radar</TabsTrigger>
            <TabsTrigger value="translation">
              Translation
              {translationNeeded.length > 0 && (
                <Badge variant="destructive" className="ml-2">{translationNeeded.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archives">Archives</TabsTrigger>
            <TabsTrigger value="usc">USC Workflows</TabsTrigger>
          </TabsList>

          {/* DOC RADAR TAB */}
          <TabsContent value="radar">
            <DocRadarPanel documents={documents} />
          </TabsContent>

          {/* TRANSLATION TAB */}
          <TabsContent value="translation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Documents Requiring Translation
                </CardTitle>
                <CardDescription>
                  Non-Polish documents that need certified translation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {translationNeeded.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>All documents are in Polish or already translated</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {translationNeeded.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{doc.person_type || "Unknown"}</Badge>
                            <Badge variant="secondary">{doc.type}</Badge>
                            {doc.file_extension && (
                              <span className="text-sm text-muted-foreground">
                                {doc.file_extension}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => createTranslationTask(doc.id, doc.name, doc.person_type)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create Task
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Translation Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Active Translation Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No translation tasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ARCHIVES TAB */}
          <TabsContent value="archives">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Polish Archive Requests
                  </CardTitle>
                  <CardDescription>
                    Generate official letters to request documents from Polish archives
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <ArchiveRequestGenerator />
            </div>
          </TabsContent>

          {/* USC WORKFLOWS TAB */}
          <TabsContent value="usc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  USC Workflows (Urząd Stanu Cywilnego)
                </CardTitle>
                <CardDescription>
                  Civil Registry workflows for document registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Umiejscowienie</CardTitle>
                      <CardDescription>
                        Register foreign document with Polish Civil Registry
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        Used when a civil act (birth, marriage) occurred abroad and needs to be
                        registered in Poland
                      </p>
                      <Button
                        onClick={() => createUSCTask('umiejscowienie', 'AP')}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Umiejscowienie Task
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Uzupełnienie</CardTitle>
                      <CardDescription>
                        Add missing information to existing Polish record
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        Used to supplement incomplete Polish civil registry records with additional
                        information
                      </p>
                      <Button
                        onClick={() => createUSCTask('uzupelnienie', 'AP')}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Uzupełnienie Task
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* USC Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle>Active USC Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                {uscWorkflows.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No USC workflows created yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uscWorkflows.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{task.related_person}</Badge>
                            <Badge variant="secondary">
                              {task.metadata?.usc_type || "Unknown"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              task.status === "completed"
                                ? "default"
                                : task.status === "in_progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
