import { useState, useEffect } from "react";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Briefcase } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { DropboxSync } from "@/components/DropboxSync";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { CaseCard } from "@/components/CaseCard";
import { useAuth } from "@/hooks/useAuth";
import { useCases, useUpdateCaseStatus, useDeleteCase } from "@/hooks/useCases";

interface FullscreenCase {
  id: string;
  client_name: string;
  client_code: string | null;
  country: string | null;
  status: string;
  generation: string | null;
  is_vip: boolean | null;
  start_date: string | null;
  progress: number | null;
  dropbox_path: string;
  notes: string | null;
  document_count: number;
}

const statusColorMap: Record<string, string> = {
  active: "bg-primary/20 text-primary border-primary/30",
  lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  finished: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  suspended: "bg-muted/20 text-muted-foreground border-muted/30",
  bad: "bg-red-600/20 text-red-500 border-red-600/30",
  name_change: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  other: "bg-muted/20 text-muted-foreground border-muted/30",
};

const Cases = () => {
  const [fullscreenCase, setFullscreenCase] = useState<FullscreenCase | null>(null);
  const [editCase, setEditCase] = useState<FullscreenCase | null>(null);

  // Use authentication hook - requires login
  const { loading: authLoading } = useAuth(true);
  
  // Use optimized cases hook with caching
  const { data: cases = [], isLoading, refetch } = useCases();
  const updateStatusMutation = useUpdateCaseStatus();
  const deleteMutation = useDeleteCase();

  const loading = authLoading || isLoading;

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreenCase) {
        setFullscreenCase(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenCase]);

  const getStatusBadge = (status: string) => {
    return statusColorMap[status] || statusColorMap.other;
  };

  const handleUpdateStatus = (caseId: string, status: string) => {
    updateStatusMutation.mutate({ caseId, status });
  };

  const handleDeleteCase = (caseId: string) => {
    deleteMutation.mutate(caseId);
  };

  const handleEdit = (clientCase: any) => {
    setEditCase(clientCase);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

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
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
                  onEdit={handleEdit}
                  onDelete={handleDeleteCase}
                  onUpdateStatus={handleUpdateStatus}
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
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{fullscreenCase.client_name}</h2>
                      <p className="text-lg text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {fullscreenCase.country || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {fullscreenCase.generation && (
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground mb-2">Generation</p>
                        <p className="text-lg font-medium capitalize">{fullscreenCase.generation}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Start Date</p>
                        </div>
                        <p className="text-lg font-medium">
                          {fullscreenCase.start_date ? new Date(fullscreenCase.start_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      {fullscreenCase.start_date && (
                        <div className="p-4 rounded-lg bg-background/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            <p className="text-sm text-muted-foreground">Duration</p>
                          </div>
                          <p className="text-lg font-medium">
                            {Math.floor((Date.now() - new Date(fullscreenCase.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(fullscreenCase.status)} capitalize`}>
                        {fullscreenCase.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-accent" />
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">{fullscreenCase.document_count}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Progress</p>
                      </div>
                      <span className="text-xl font-bold">{fullscreenCase.progress || 0}%</span>
                    </div>
                    <div className="h-3 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${fullscreenCase.progress || 0}%` }}
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
            name: editCase.client_name,
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
          onUpdate={() => {
            refetch();
            setEditCase(null);
          }}
        />
      )}
    </div>
  );
};

export default Cases;
