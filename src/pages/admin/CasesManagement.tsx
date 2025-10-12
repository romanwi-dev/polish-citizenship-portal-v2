import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { CaseFilters } from "@/components/CaseFilters";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { CaseCard } from "@/components/CaseCard";
import { CaseCardSkeletonGrid } from "@/components/CaseCardSkeleton";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { 
  Plus, 
  Database,
  ArrowUpDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsStaff } from "@/hooks/useUserRole";
import { useCases, useUpdateCaseStatus, useDeleteCase } from "@/hooks/useCases";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFavoriteCases } from "@/hooks/useFavoriteCases";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { toastSuccess, toastError } from "@/utils/toastNotifications";

export default function CasesManagement() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingModeFilter, setProcessingModeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState<[number, number]>([0, 100]);
  const [ageFilter, setAgeFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState<[number, number]>([0, 100]);
  const [editCase, setEditCase] = useState<any>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "name" | "date" | "progress">("default");
  
  // Authentication and authorization
  const { user, loading: authLoading } = useAuth(true);
  const { data: isStaff, isLoading: roleLoading } = useIsStaff(user?.id);
  
  // Data fetching with optimized hooks
  const { data: cases = [], isLoading: casesLoading, error, refetch } = useCases();
  const updateStatusMutation = useUpdateCaseStatus();
  const deleteMutation = useDeleteCase();
  const { favorites, toggleFavorite, isFavorite } = useFavoriteCases(user?.id);

  const loading = authLoading || roleLoading || casesLoading;

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setProcessingModeFilter("all");
    setScoreFilter([0, 100]);
    setAgeFilter("all");
    setProgressFilter([0, 100]);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      ctrlKey: true,
      handler: () => navigate("/admin/cases/new"),
      description: "Create new case",
    },
    {
      key: "k",
      ctrlKey: true,
      handler: () => searchInputRef.current?.focus(),
      description: "Focus search",
    },
    {
      key: "r",
      ctrlKey: true,
      handler: () => {
        refetch();
        toastSuccess.refreshed("Cases");
      },
      description: "Refresh cases",
    },
    {
      key: "x",
      ctrlKey: true,
      handler: handleClearFilters,
      description: "Clear filters",
    },
    {
      key: "?",
      shiftKey: true,
      handler: () => setShowShortcuts(true),
      description: "Show shortcuts",
    },
  ]);

  const handleUpdateStatus = (caseId: string, status: string) => {
    updateStatusMutation.mutate({ caseId, status });
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      deleteMutation.mutate(caseId);
    }
  };

  const handleEdit = (caseItem: any) => {
    setEditCase(caseItem);
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
    let filtered = cases.filter(c => {
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
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      // Custom sorting
      if (sortBy === "name") {
        return a.client_name.localeCompare(b.client_name);
      }
      if (sortBy === "date") {
        return new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime();
      }
      if (sortBy === "progress") {
        return (b.progress || 0) - (a.progress || 0);
      }

      // Default sorting
        // Other status cases go to the very bottom
        if (a.status === 'other' && b.status !== 'other') return 1;
        if (a.status !== 'other' && b.status === 'other') return -1;
        
        // Bad status cases go above other, but below everything else
        if (a.status === 'bad' && b.status !== 'bad') return 1;
        if (a.status !== 'bad' && b.status === 'bad') return -1;
        
        // ON_HOLD, NAME_CHANGE, and SUSPENDED cases go below active cases
        const lowerPriorityStatuses = ['on_hold', 'name_change', 'suspended'];
        const aIsLower = lowerPriorityStatuses.includes(a.status);
        const bIsLower = lowerPriorityStatuses.includes(b.status);
        if (aIsLower && !bIsLower) return 1;
        if (!aIsLower && bIsLower) return -1;
        
        // VIP cases first
        if (a.is_vip && !b.is_vip) return -1;
        if (!a.is_vip && b.is_vip) return 1;
        
        // Then sort by client score (higher scores first)
        const scoreA = a.client_score || 0;
        const scoreB = b.client_score || 0;
        return scoreB - scoreA;
    });
  }, [cases, searchTerm, statusFilter, processingModeFilter, scoreFilter, ageFilter, progressFilter, sortBy]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 bg-background min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">Cases Management</h1>
              <p className="text-muted-foreground">Manage all client cases</p>
            </div>
          </div>
          <CaseCardSkeletonGrid count={6} />
        </div>
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
    <ErrorBoundary>
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
          searchInputRef={searchInputRef}
        />

        {/* Sort Controls */}
        {filteredCases.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-2">
              {[
                { value: "default", label: "Default" },
                { value: "name", label: "Name" },
                { value: "date", label: "Date" },
                { value: "progress", label: "Progress" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(option.value as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {filteredCases.length === 0 ? (
          <EmptyState
            icon={Database}
            title={searchTerm || activeFiltersCount > 0 ? "No Matching Cases" : "No Cases Found"}
            description={
              searchTerm || activeFiltersCount > 0
                ? "Try adjusting your search or filters."
                : "Start by syncing with Dropbox or creating a new case."
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
            {filteredCases.map((caseItem) => (
              <CaseCard 
                key={caseItem.id}
                clientCase={caseItem}
                onEdit={handleEdit}
                onDelete={handleDeleteCase}
                onUpdateStatus={handleUpdateStatus}
                isFavorite={isFavorite(caseItem.id)}
                onToggleFavorite={() => toggleFavorite(caseItem.id)}
              />
            ))}
          </div>
        )}
      </div>

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

      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
      </AdminLayout>
    </ErrorBoundary>
  );
}
