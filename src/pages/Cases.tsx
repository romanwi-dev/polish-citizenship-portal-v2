import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Briefcase, Edit } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DropboxSync } from "@/components/DropboxSync";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { toast } from "sonner";

interface ClientCase {
  id: string;
  name: string;
  client_code?: string;
  country: string;
  status: string;
  generation?: string;
  is_vip: boolean;
  startDate: string;
  documents: number;
  progress: number;
  ancestry: string;
  dropbox_path: string;
  notes?: string;
}

const statusColorMap: Record<string, string> = {
  active: "bg-primary/20 text-primary border-primary/30",
  lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  finished: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  suspended: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  bad: "bg-red-600/20 text-red-500 border-red-600/30",
  name_change: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  other: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const CaseCard = memo(({ clientCase, onOpenFullscreen, onEdit }: { clientCase: ClientCase; onOpenFullscreen: (c: ClientCase) => void; onEdit: (c: ClientCase) => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getStatusBadge = (status: string) => {
    return statusColorMap[status] || statusColorMap.other;
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDoubleClick = () => {
    onOpenFullscreen(clientCase);
    setIsFlipped(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(clientCase);
  };

  return (
    <div 
      className="perspective-1000 cursor-pointer h-[520px]"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden glass-card p-6 rounded-lg hover-glow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {clientCase.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {clientCase.country}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize flex-shrink-0`}>
                {clientCase.status.replace(/_/g, ' ')}
              </span>
              {clientCase.is_vip && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
                  VIP
                </span>
              )}
            </div>
          </div>

          <div className="mb-4 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground mb-1">Polish Ancestry</p>
            <p className="text-sm font-medium">{clientCase.ancestry || "No ancestry info"}</p>
          </div>

          {clientCase.client_code && (
            <div className="mb-4 p-2 rounded-lg bg-background/30">
              <p className="text-xs text-muted-foreground">Case Code</p>
              <p className="text-sm font-mono">{clientCase.client_code}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="text-sm font-medium">{new Date(clientCase.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
              <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="text-sm font-medium">{clientCase.documents}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Progress</span>
              </div>
              <span className="font-bold">{clientCase.progress}%</span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                style={{ width: `${clientCase.progress}%` }}
              />
            </div>
          </div>

          {clientCase.status === "finished" && (
            <div className="mb-4 flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Citizenship Granted</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-auto"
            onClick={handleEdit}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Details
          </Button>
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 glass-card p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Case Details
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {clientCase.client_code && (
                <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Case Reference</p>
                  <p className="font-bold text-lg text-primary">{clientCase.client_code}</p>
                </div>
              )}

              {clientCase.generation && (
                <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Generation</p>
                  <p className="font-bold text-base capitalize">{clientCase.generation}</p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Timeline Details</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-xs flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-primary" />
                      Started
                    </span>
                    <span className="text-xs font-bold">{new Date(clientCase.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-xs flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-secondary" />
                      Days Active
                    </span>
                    <span className="text-xs font-bold">
                      {Math.floor((Date.now() - new Date(clientCase.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-accent" />
                      Completion
                    </span>
                    <span className="text-xs font-bold text-primary">{clientCase.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Documents Status</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <span className="text-xs">Total Submitted</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{clientCase.documents}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <p className="font-bold text-base">{clientCase.country}</p>
                </div>
              </div>

              {clientCase.status === "finished" && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-bold text-sm text-green-400">Application Approved</p>
                      <p className="text-xs text-green-400/80">Polish Citizenship Confirmed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CaseCard.displayName = "CaseCard";

const Cases = () => {
  const navigate = useNavigate();
  const [fullscreenCase, setFullscreenCase] = useState<ClientCase | null>(null);
  const [editCase, setEditCase] = useState<ClientCase | null>(null);
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Load cases from database
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (casesError) throw casesError;

      if (casesData) {
        const casesWithDocs = await Promise.all(
          casesData.map(async (caseData) => {
            const { count } = await supabase
              .from("documents")
              .select("*", { count: "exact", head: true })
              .eq("case_id", caseData.id);

            return {
              id: caseData.id,
              name: caseData.client_name,
              client_code: caseData.client_code || undefined,
              country: caseData.country || "Poland",
              status: caseData.status,
              generation: caseData.generation || undefined,
              is_vip: caseData.is_vip,
              startDate: caseData.start_date || caseData.created_at,
              documents: count || 0,
              progress: caseData.progress,
              dropbox_path: caseData.dropbox_path,
              notes: caseData.notes || undefined,
              ancestry: typeof caseData.ancestry === 'object' && caseData.ancestry && caseData.ancestry !== null
                ? JSON.stringify(caseData.ancestry) 
                : (typeof caseData.ancestry === 'string' ? caseData.ancestry : "No ancestry info"),
            } as ClientCase;
          })
        );

        setCases(casesWithDocs);
      }
    } catch (error) {
      console.error("Error loading cases:", error);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreenCase) {
        setFullscreenCase(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenCase]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('cases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases'
        },
        () => {
          loadCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    return statusColorMap[status] || statusColorMap.other;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse delay-700" />
      </div>
      
      <section className="relative py-32 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Client Portfolio</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Cases Management
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track and manage all client citizenship applications in one place
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <DropboxSync />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading cases...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cases found. Sync with Dropbox to import cases.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {cases.map((clientCase) => (
                <CaseCard 
                  key={clientCase.id}
                  clientCase={clientCase}
                  onOpenFullscreen={setFullscreenCase}
                  onEdit={setEditCase}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {fullscreenCase && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreenCase(null)}
        >
          <div 
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={() => setFullscreenCase(null)}
              size="icon"
              variant="ghost"
              className="absolute -top-12 right-0 glass-card hover-glow hover:rotate-90 transition-transform duration-300"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border shadow-2xl backdrop-blur-xl">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{fullscreenCase.name}</h2>
                      <p className="text-lg text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {fullscreenCase.country}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <p className="text-sm text-muted-foreground mb-2">Polish Ancestry</p>
                      <p className="text-lg font-medium">{fullscreenCase.ancestry}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Start Date</p>
                        </div>
                        <p className="text-lg font-medium">
                          {new Date(fullscreenCase.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-secondary" />
                          <p className="text-sm text-muted-foreground">Duration</p>
                        </div>
                        <p className="text-lg font-medium">
                          {Math.floor((Date.now() - new Date(fullscreenCase.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(fullscreenCase.status)}`}>
                        {fullscreenCase.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-accent" />
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">{fullscreenCase.documents}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Progress</p>
                      </div>
                      <span className="text-xl font-bold">{fullscreenCase.progress}%</span>
                    </div>
                    <div className="h-3 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${fullscreenCase.progress}%` }}
                      />
                    </div>
                  </div>

                  {fullscreenCase.status === "finished" && (
                    <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/40">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="font-bold text-base text-green-400">Application Approved</p>
                          <p className="text-sm text-green-400/80">Polish Citizenship Confirmed</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editCase && (
        <EditCaseDialog
          caseData={{
            id: editCase.id,
            name: editCase.name,
            client_code: editCase.client_code,
            country: editCase.country,
            status: editCase.status,
            generation: editCase.generation,
            is_vip: editCase.is_vip,
            notes: editCase.notes,
            progress: editCase.progress,
          }}
          open={!!editCase}
          onOpenChange={(open) => !open && setEditCase(null)}
          onUpdate={loadCases}
        />
      )}
    </div>
  );
};

export default Cases;
