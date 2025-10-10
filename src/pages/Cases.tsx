import { useState, useEffect, useMemo } from "react";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Database } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { DropboxSync } from "@/components/DropboxSync";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { CaseCard } from "@/components/CaseCard";
import { CaseFilters } from "@/components/CaseFilters";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useAuth } from "@/hooks/useAuth";
import { useCases, useUpdateCaseStatus, useDeleteCase } from "@/hooks/useCases";
import { STATUS_COLORS } from "@/lib/constants";

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

const Cases = () => {
  const [fullscreenCase, setFullscreenCase] = useState<FullscreenCase | null>(null);
  const [editCase, setEditCase] = useState<FullscreenCase | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingModeFilter, setProcessingModeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState<[number, number]>([0, 100]);
  const [ageFilter, setAgeFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState<[number, number]>([0, 100]);

  // Use authentication hook - requires login
  const { loading: authLoading } = useAuth(true);
  
  // Use optimized cases hook with caching
  const { data: cases = [], isLoading, error, refetch } = useCases();
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
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.other;
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

  // Calculate case age in days
  const getCaseAge = (startDate: string | null) => {
    if (!startDate) return 0;
    return Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  // Filter cases based on all criteria
  const filteredCases = useMemo(() => {
    return cases
      .filter(c => {
        // Search filter
        const matchesSearch = searchTerm === "" || 
          c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.client_code && c.client_code.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;

        // Processing mode filter
        const matchesProcessingMode = processingModeFilter === "all" || c.processing_mode === processingModeFilter;

        // Score filter
        const matchesScore = c.client_score >= scoreFilter[0] && c.client_score <= scoreFilter[1];

        // Age filter
        const caseAge = getCaseAge(c.start_date);
        const matchesAge = ageFilter === "all" || 
          (ageFilter === "new" && caseAge <= 30) ||
          (ageFilter === "recent" && caseAge > 30 && caseAge <= 90) ||
          (ageFilter === "medium" && caseAge > 90 && caseAge <= 180) ||
          (ageFilter === "old" && caseAge > 180);

        // Progress filter
        const progress = c.progress || 0;
        const matchesProgress = progress >= progressFilter[0] && progress <= progressFilter[1];

        return matchesSearch && matchesStatus && matchesProcessingMode && 
               matchesScore && matchesAge && matchesProgress;
      })
      .sort((a, b) => {
        // Other status cases go to the very bottom
        if (a.status === 'other' && b.status !== 'other') return 1;
        if (a.status !== 'other' && b.status === 'other') return -1;
        
        // Bad status cases go above other, but below everything else
        if (a.status === 'bad' && b.status !== 'bad') return 1;
        if (a.status !== 'bad' && b.status === 'bad') return -1;
        
        // VIP cases first
        if (a.is_vip && !b.is_vip) return -1;
        if (!a.is_vip && b.is_vip) return 1;
        
        // Then sort by client score (higher scores first)
        const scoreA = a.client_score || 0;
        const scoreB = b.client_score || 0;
        return scoreB - scoreA;
      });
  }, [cases, searchTerm, statusFilter, processingModeFilter, scoreFilter, ageFilter, progressFilter]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (processingModeFilter !== "all") count++;
    if (ageFilter !== "all") count++;
    if (scoreFilter[0] !== 0 || scoreFilter[1] !== 100) count++;
    if (progressFilter[0] !== 0 || progressFilter[1] !== 100) count++;
    return count;
  }, [statusFilter, processingModeFilter, ageFilter, scoreFilter, progressFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter("all");
    setProcessingModeFilter("all");
    setScoreFilter([0, 100]);
    setAgeFilter("all");
    setProgressFilter([0, 100]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Verifying authentication..." />
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text mb-6">
              Cases Management
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track and manage all client citizenship applications in one place
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <DropboxSync />
          </div>

          <div className="max-w-7xl mx-auto">
            <CaseFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              processingModeFilter={processingModeFilter}
              onProcessingModeChange={setProcessingModeFilter}
              scoreFilter={scoreFilter}
              onScoreChange={setScoreFilter}
              ageFilter={ageFilter}
              onAgeChange={setAgeFilter}
              progressFilter={progressFilter}
              onProgressChange={setProgressFilter}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
            />

          {error ? (
            <ErrorState 
              message="Failed to load cases. Please try again."
              retry={() => refetch()}
            />
          ) : loading ? (
            <LoadingState message="Loading cases..." />
          ) : filteredCases.length === 0 ? (
            <EmptyState
              icon={Database}
              title={searchTerm || activeFiltersCount > 0 ? "No Matching Cases" : "No Cases Found"}
              description={
                searchTerm || activeFiltersCount > 0
                  ? "Try adjusting your search or filters."
                  : "Sync with Dropbox to import cases or create your first case manually."
              }
              action={
                searchTerm || activeFiltersCount > 0 ? {
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchTerm("");
                    handleClearFilters();
                  }
                } : {
                  label: "Refresh",
                  onClick: () => refetch()
                }
              }
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCases.map((clientCase) => (
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
