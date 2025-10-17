import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  FileText, 
  MessageSquare, 
  FileCheck, 
  LogOut, 
  Download,
  Shield,
  Lock,
  Clock,
  Trash2
} from "lucide-react";
import { CaseStageVisualization } from "@/components/CaseStageVisualization";
import { FileUploadSection } from "@/components/client/FileUploadSection";
import { MessagingSection } from "@/components/client/MessagingSection";

export default function ClientDashboard() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [poa, setPoa] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    // Check authentication with Supabase
    const checkAuth = async () => {
      try {
        const { data: { session: authSession }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !authSession) {
          toast.error("Please log in to access your dashboard");
          navigate("/client/login");
          return;
        }

        // Verify case access
        const { data: access, error: accessError } = await supabase
          .from('client_portal_access')
          .select('case_id')
          .eq('user_id', authSession.user.id)
          .eq('case_id', caseId)
          .maybeSingle();

        if (!mounted) return;

        if (accessError || !access) {
          toast.error("You don't have access to this case");
          navigate("/client/login");
          return;
        }

        setSession(authSession);
        loadDashboardData();
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          navigate("/client/login");
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT' || !authSession) {
        navigate("/client/login");
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(authSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [caseId, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load case data
      const { data: caseInfo } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();

      setCaseData(caseInfo);

      // Load documents
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      setDocuments(docs || []);

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      setMessages(msgs || []);

      // Load POA
      const { data: poaData } = await supabase
        .from("poa")
        .select("*")
        .eq("case_id", caseId)
        .eq("client_signed", true)
        .maybeSingle();

      setPoa(poaData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/client/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading your portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{caseData?.client_name}</h1>
            <p className="text-sm text-muted-foreground">Case: {caseData?.client_code}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Security Badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Badge className="px-3 py-1 text-xs">
            <Lock className="h-3 w-3 mr-1" />
            TLS 1.3 Encryption
          </Badge>
          <Badge className="px-3 py-1 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            5min Max Processing
          </Badge>
          <Badge className="px-3 py-1 text-xs">
            <Trash2 className="h-3 w-3 mr-1" />
            Auto Deletion
          </Badge>
          <Badge className="px-3 py-1 text-xs">
            <FileCheck className="h-3 w-3 mr-1" />
            SOC 2 Certified
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('/client/security', '_blank')}
            className="ml-2"
          >
            <Shield className="h-3 w-3 mr-1" />
            Learn More
          </Button>
        </div>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="poa">POA</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Case Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseStageVisualization 
                  completedStages={[]}
                  currentStage={caseData?.current_stage || "lead"}
                />
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{caseData?.progress || 0}%</div>
                      <p className="text-sm text-muted-foreground">Overall Progress</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{documents.length}</div>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <Badge variant={caseData?.status === "active" ? "default" : "secondary"}>
                        {caseData?.status || "Unknown"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">Current Status</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No documents yet</p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type || "Document"} • {doc.category}
                            </p>
                          </div>
                        </div>
                        {doc.is_verified && (
                          <Badge variant="outline" className="bg-green-500/10">
                            <FileCheck className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <FileUploadSection 
              caseId={caseId!} 
              onUploadComplete={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="poa">
            <Card>
              <CardHeader>
                <CardTitle>Power of Attorney</CardTitle>
              </CardHeader>
              <CardContent>
                {poa ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5">
                      <div>
                        <p className="font-medium">POA Signed</p>
                        <p className="text-sm text-muted-foreground">
                          Signed on {new Date(poa.client_signature_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10">
                        <FileCheck className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                    {poa.pdf_url && (
                      <Button className="w-full" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download POA
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No signed POA available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <MessagingSection 
              caseId={caseId!} 
              currentUserId={session?.user?.id || "client"}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
