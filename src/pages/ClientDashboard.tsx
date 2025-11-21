// 🛑 AI & LOVABLE WARNING
// This file belongs to the Polish Citizenship Portal LEGACY. 
// DO NOT change layout, structure or delete content.
// Only SMALL, EXPLICIT changes described in the current task are allowed.
// i18n engine lives in src/i18n/** and MUST NOT be edited by AI.

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
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
  Trash2,
  Plane
} from "lucide-react";
import { CaseStageVisualization } from "@/components/CaseStageVisualization";
import { FileUploadSection } from "@/components/client/FileUploadSection";
import { MessagingSection } from "@/components/client/MessagingSection";
import { ConsulateKitGenerator } from "@/components/passport/ConsulateKitGenerator";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function ClientDashboard() {
  const { t } = useTranslation('portal');
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
          toast.error(t('dashboard.loginRequired')); // Please log in to access your dashboard
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
          toast.error(t('dashboard.accessDenied')); // You don't have access to this case
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

  const loadDashboardData = useCallback(async () => {
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
      toast.error(t('dashboard.loadError')); // Failed to load dashboard data
    } finally {
      setLoading(false);
    }
  }, [caseId, t]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    toast.success(t('dashboard.logoutSuccess')); // Logged out successfully
    navigate("/client/login");
  }, [t, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">{t('dashboard.loading')}</div> {/* Loading your portal... */}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        {/* DASHBOARD-UX-SAFE: Improved responsive layout for mobile screens */}
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="min-w-0 flex-1 w-full sm:w-auto">
            {/* DASHBOARD-UX-SAFE: Truncate long names on mobile */}
            <h1 className="text-xl sm:text-2xl font-bold truncate">{caseData?.client_name}</h1>
            <p className="text-sm text-muted-foreground truncate">{t('dashboard.caseLabel')} {caseData?.client_code}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto justify-end">
            <LanguageSelector />
            <Button variant="outline" onClick={handleLogout} size="sm" className="flex-shrink-0">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.logout')}</span>
              <span className="sm:hidden">{t('dashboard.logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* DASHBOARD-UX-SAFE: Security badges - improved mobile wrapping */}
        <div className="flex flex-wrap gap-2 justify-center mb-4 sm:mb-6">
          <Badge className="px-2 sm:px-3 py-1 text-xs">
            <Lock className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">{t('dashboard.tlsEncryption')}</span>
            <span className="sm:hidden">TLS 1.3</span>
          </Badge>
          <Badge className="px-2 sm:px-3 py-1 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">{t('dashboard.maxProcessing')}</span>
            <span className="sm:hidden">5min Max</span>
          </Badge>
          <Badge className="px-2 sm:px-3 py-1 text-xs">
            <Trash2 className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">{t('dashboard.autoDeletion')}</span>
            <span className="sm:hidden">Auto Del</span>
          </Badge>
          <Badge className="px-2 sm:px-3 py-1 text-xs">
            <FileCheck className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">{t('dashboard.soc2Certified')}</span>
            <span className="sm:hidden">SOC 2</span>
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('/client/security', '_blank')}
            className="h-auto px-2 py-1 text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            {t('dashboard.learnMore')}
          </Button>
        </div>

        <Tabs defaultValue="timeline" className="space-y-4 sm:space-y-6">
          {/* DASHBOARD-UX-SAFE: Improved tab layout for mobile - scrollable horizontal tabs */}
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1">
            <TabsTrigger value="timeline" className="text-xs sm:text-sm py-2">{t('dashboard.tabTimeline')}</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm py-2">{t('dashboard.tabDocuments')}</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm py-2">{t('dashboard.tabUpload')}</TabsTrigger>
            <TabsTrigger value="poa" className="text-xs sm:text-sm py-2">POA</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm py-2">{t('dashboard.tabMessages')}</TabsTrigger>
            <TabsTrigger value="passport" className="text-xs sm:text-sm py-2 flex items-center justify-center gap-1">
              <Plane className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('dashboard.tabPassport')}</span>
              <span className="sm:hidden">Pass</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t('dashboard.caseProgress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseStageVisualization 
                  completedStages={[]}
                  currentStage={caseData?.current_stage || "lead"}
                />
                {/* DASHBOARD-UX-SAFE: Improved grid layout for mobile - single column on small screens */}
                <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                  <Card>
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="text-xl sm:text-2xl font-bold">{caseData?.progress || 0}%</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.overallProgress')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="text-xl sm:text-2xl font-bold">{documents.length}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.documents')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 sm:pt-6">
                      <Badge variant={caseData?.status === "active" ? "default" : "secondary"} className="text-xs">
                        {caseData?.status || t('dashboard.unknownStatus')}
                      </Badge>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('dashboard.currentStatus')}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t('dashboard.yourDocuments')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">{t('dashboard.noDocuments')}</p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors gap-2"
                      >
                        {/* DASHBOARD-UX-SAFE: Improved document list - better mobile layout */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{doc.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {doc.type || t('dashboard.documentLabel')} • {doc.category}
                            </p>
                          </div>
                        </div>
                        {doc.is_verified && (
                          <Badge variant="outline" className="bg-green-500/10 flex-shrink-0 text-xs">
                            <FileCheck className="mr-1 h-3 w-3" />
                            {t('dashboard.verified')}
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
                <CardTitle className="text-lg sm:text-xl">{t('dashboard.powerOfAttorney')}</CardTitle>
              </CardHeader>
              <CardContent>
                {poa ? (
                  <div className="space-y-4">
                    {/* DASHBOARD-UX-SAFE: Improved POA layout for mobile */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-green-500/5 gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base">{t('dashboard.poaSigned')}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {t('dashboard.signedOn')} {new Date(poa.client_signature_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 flex-shrink-0 text-xs">
                        <FileCheck className="mr-1 h-3 w-3" />
                        {t('dashboard.active')}
                      </Badge>
                    </div>
                    {poa.pdf_url && (
                      <Button className="w-full" variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        {t('dashboard.downloadPoa')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm">
                    {t('dashboard.noPoaYet')}
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

          <TabsContent value="passport">
            <ConsulateKitGenerator
              caseId={caseId!}
              clientName={caseData?.client_name || "Client"}
              decisionReceived={caseData?.decision_received || false}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
