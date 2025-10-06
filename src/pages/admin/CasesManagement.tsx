import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CaseFilters } from "@/components/CaseFilters";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MoreVertical,
  Copy,
  Download,
  Pause,
  Ban,
  XCircle,
  Archive,
  Trash2,
  Database,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIsStaff } from "@/hooks/useUserRole";
import { useCases, useUpdateCaseStatus, useDeleteCase } from "@/hooks/useCases";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export default function CasesManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingModeFilter, setProcessingModeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState<[number, number]>([0, 100]);
  const [ageFilter, setAgeFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState<[number, number]>([0, 100]);
  const [editCase, setEditCase] = useState<any>(null);
  
  // Authentication and authorization
  const { user, loading: authLoading } = useAuth(true);
  const { data: isStaff, isLoading: roleLoading } = useIsStaff(user?.id);
  
  // Data fetching with optimized hooks
  const { data: cases = [], isLoading: casesLoading, error, refetch } = useCases();
  const updateStatusMutation = useUpdateCaseStatus();
  const deleteMutation = useDeleteCase();

  const loading = authLoading || roleLoading || casesLoading;

  const handleCopyId = (caseId: string) => {
    navigator.clipboard.writeText(caseId);
    toast.success("Case ID copied to clipboard");
  };

  const handleExport = async (caseId: string) => {
    toast.info("Exporting case data...");
    // TODO: Implement export functionality
  };

  const handlePostpone = (caseId: string) => {
    updateStatusMutation.mutate({ caseId, status: "on_hold" });
  };

  const handleSuspend = (caseId: string) => {
    updateStatusMutation.mutate({ caseId, status: "suspended" });
  };

  const handleCancel = (caseId: string) => {
    updateStatusMutation.mutate({ caseId, status: "failed" });
  };

  const handleArchive = (caseId: string) => {
    updateStatusMutation.mutate({ caseId, status: "finished" });
  };

  const handleDelete = (caseId: string) => {
    if (confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      deleteMutation.mutate(caseId);
    }
  };

  const handleEdit = (caseItem: any) => {
    setEditCase(caseItem);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setProcessingModeFilter("all");
    setScoreFilter([0, 100]);
    setAgeFilter("all");
    setProgressFilter([0, 100]);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (processingModeFilter !== "all") count++;
    if (ageFilter !== "all") count++;
    if (scoreFilter[0] !== 0 || scoreFilter[1] !== 100) count++;
    if (progressFilter[0] !== 0 || progressFilter[1] !== 100) count++;
    return count;
  }, [statusFilter, processingModeFilter, ageFilter, scoreFilter, progressFilter]);

  const filteredCases = useMemo(() => {
    // Deduplicate cases by ID first
    const uniqueCases = Array.from(
      new Map(cases.map(c => [c.id, c])).values()
    );
    
    return uniqueCases
      .filter(c => {
        // Search filter
        const matchesSearch = c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.client_code && c.client_code.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Status filter
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        
        // Processing mode filter
        const matchesProcessingMode = processingModeFilter === "all" || c.processing_mode === processingModeFilter;
        
        // Score filter
        const score = c.client_score || 0;
        const matchesScore = score >= scoreFilter[0] && score <= scoreFilter[1];
        
        // Progress filter
        const progress = c.progress || 0;
        const matchesProgress = progress >= progressFilter[0] && progress <= progressFilter[1];
        
        // Age filter
        let matchesAge = true;
        if (ageFilter !== "all" && c.start_date) {
          const startDate = new Date(c.start_date);
          const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (ageFilter) {
            case "new":
              matchesAge = daysSinceStart <= 30;
              break;
            case "recent":
              matchesAge = daysSinceStart > 30 && daysSinceStart <= 90;
              break;
            case "medium":
              matchesAge = daysSinceStart > 90 && daysSinceStart <= 180;
              break;
            case "old":
              matchesAge = daysSinceStart > 180;
              break;
          }
        }
        
        return matchesSearch && matchesStatus && matchesProcessingMode && matchesScore && matchesProgress && matchesAge;
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

  if (loading) {
    return (
      <AdminLayout>
        <LoadingState message="Loading cases..." className="h-screen" />
      </AdminLayout>
    );
  }

  if (!isStaff) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <ErrorState 
            title="Access Denied"
            message="You don't have permission to access this page."
          />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <ErrorState 
            message="Failed to load cases. Please try again."
            retry={() => refetch()}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-background min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Cases Management</h1>
            <p className="text-muted-foreground">Manage all client cases</p>
          </div>
          <Button onClick={() => navigate("/admin/cases/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>

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

        {filteredCases.length === 0 ? (
          <EmptyState
            icon={Database}
            title={searchTerm ? "No Matching Cases" : "No Cases Found"}
            description={searchTerm ? "Try adjusting your search term." : "Start by syncing with Dropbox or creating a new case."}
            action={searchTerm ? undefined : {
              label: "Refresh",
              onClick: () => refetch()
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="p-6 hover-glow transition-all bg-card/50 backdrop-blur-sm border-border/50"
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/admin/cases/${caseItem.id}`)}
                >
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">{caseItem.client_name}</h3>
                    {caseItem.client_code && (
                      <Badge variant="outline">{caseItem.client_code}</Badge>
                    )}
                    <Badge className="bg-primary">
                      {caseItem.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    {caseItem.processing_mode && (
                      <Badge 
                        variant={
                          caseItem.processing_mode === 'vip_plus' ? 'vipPlus' :
                          caseItem.processing_mode === 'vip' ? 'vip' :
                          caseItem.processing_mode === 'expedited' ? 'expedited' :
                          'standard'
                        }
                      >
                        {caseItem.processing_mode === 'vip_plus' ? 'VIP+' : caseItem.processing_mode.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Docs: {caseItem.document_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Progress: {caseItem.progress || 0}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Progress: {caseItem.progress}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${caseItem.progress}%` }}
                    />
                  </div>
                </div>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card z-50">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(caseItem);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Case
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleCopyId(caseItem.id);
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleExport(caseItem.id);
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handlePostpone(caseItem.id);
                    }}>
                      <Pause className="h-4 w-4 mr-2" />
                      Postpone
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleSuspend(caseItem.id);
                    }}>
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(caseItem.id);
                    }}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(caseItem.id);
                    }}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(caseItem.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  size="default"
                  className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${caseItem.id}`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                    View Case
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button
                  size="default"
                  className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open('/family-tree.pdf', '_blank');
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                    Family Tree
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button
                  size="default"
                  className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${caseItem.id}`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                    View Case
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button
                  size="default"
                  className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${caseItem.id}?tab=oby`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                    Draft OBY
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </Card>
          ))}
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
            onUpdate={() => setEditCase(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
