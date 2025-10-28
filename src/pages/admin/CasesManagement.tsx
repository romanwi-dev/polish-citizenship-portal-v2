import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { CaseFilters } from "@/components/CaseFilters";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { DraggableCaseCard } from "@/components/DraggableCaseCard";
import { CaseCardSkeletonGrid } from "@/components/CaseCardSkeleton";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { 
  Plus, 
  Database,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useIsStaff } from "@/hooks/useUserRole";
import { useCases, useUpdateCaseStatus, useDeleteCase } from "@/hooks/useCases";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFavoriteCases } from "@/hooks/useFavoriteCases";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalSearch } from "@/components/GlobalSearch";
import { BulkActionsToolbar } from "@/components/BulkActionsToolbar";
import { toast } from "sonner";
import { toastSuccess, toastError } from "@/utils/toastNotifications";
import { useBulkCaseActions } from "@/hooks/useBulkCaseActions";
import { useUpdateCaseSortOrders, useResetCaseSortOrders } from "@/hooks/useCaseSortOrder";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "name" | "date" | "progress" | "mode" | "score" | "stage" | "pay">("default");
  
  // Bulk actions
  const {
    selectedCaseIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkStatusUpdate,
    bulkDelete,
    exportToCSV,
    isSelected,
  } = useBulkCaseActions();
  
  // Authentication and authorization
  const { user, loading: authLoading } = useAuth(true);
  const { data: isStaff, isLoading: roleLoading } = useIsStaff(user?.id);
  
  // Data fetching with optimized hooks
  const { data: cases = [], isLoading: casesLoading, error, refetch } = useCases();
  const updateStatusMutation = useUpdateCaseStatus();
  const deleteMutation = useDeleteCase();
  const { favorites, toggleFavorite, isFavorite } = useFavoriteCases(user?.id);
  const updateSortOrdersMutation = useUpdateCaseSortOrders();
  const resetSortOrdersMutation = useResetCaseSortOrders();
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      handler: () => setShowGlobalSearch(true),
      description: "Global search",
    },
    {
      key: "/",
      handler: () => searchInputRef.current?.focus(),
      description: "Focus filter search",
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = filteredCases.findIndex(c => c.id === active.id);
    const newIndex = filteredCases.findIndex(c => c.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const reordered = arrayMove(filteredCases, oldIndex, newIndex);
    
    const updates = reordered.map((caseItem, index) => ({
      case_id: caseItem.id,
      sort_order: index,
    }));
    
    updateSortOrdersMutation.mutate(updates);
  };

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
      // Manual sort order takes absolute priority
      const aOrder = a.sort_order;
      const bOrder = b.sort_order;
      
      if (aOrder !== null && bOrder !== null) {
        return aOrder - bOrder;
      }
      
      if (aOrder !== null && bOrder === null) {
        return -1;
      }
      
      if (aOrder === null && bOrder !== null) {
        return 1;
      }
      
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
      if (sortBy === "mode") {
        const modeOrder = { vip_plus: 4, vip: 3, expedited: 2, standard: 1 };
        const modeA = modeOrder[a.processing_mode as keyof typeof modeOrder] || 0;
        const modeB = modeOrder[b.processing_mode as keyof typeof modeOrder] || 0;
        return modeB - modeA;
      }
      if (sortBy === "score") {
        return (b.client_score || 0) - (a.client_score || 0);
      }
      if (sortBy === "stage") {
        // Sort by completion/stage status
        const stageScore = (c: any) => {
          let score = 0;
          if (c.decision_received) score += 4;
          else if (c.wsc_received) score += 3;
          else if (c.oby_filed) score += 2;
          else if (c.poa_approved) score += 1;
          return score;
        };
        return stageScore(b) - stageScore(a);
      }
      if (sortBy === "pay") {
        // Sort by processing mode as proxy for payment tier
        const payOrder = { vip_plus: 4, vip: 3, expedited: 2, standard: 1 };
        const payA = payOrder[a.processing_mode as keyof typeof payOrder] || 0;
        const payB = payOrder[b.processing_mode as keyof typeof payOrder] || 0;
        return payB - payA;
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
        <div className="p-4 sm:p-8 max-w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-foreground bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Cases Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage all client cases</p>
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
      <div className="p-4 sm:p-8 max-w-full overflow-x-hidden">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Management
              </span>
            </h1>
          </div>

          {/* Action Buttons Row - Mobile Optimized */}
          <div className="flex flex-col gap-3 mb-3">
            {/* Mobile layout */}
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              <Button 
                onClick={() => navigate("/admin/cases/new")}
                className="w-full h-12"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>

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

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40 z-10" />
                <Input
                  ref={searchInputRef}
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Desktop layout - 3 column grid */}
            <div className="hidden sm:grid sm:grid-cols-[140px_1fr_140px] gap-3 items-center">
              {/* Left: Filters Button */}
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
                className="w-full"
              />

              {/* Center: Search Bar */}
              <div className="relative w-full max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40 z-10" />
                <Input
                  ref={searchInputRef}
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 w-full"
                />
              </div>

              {/* Right: New Case Button */}
              <Button 
                onClick={() => navigate("/admin/cases/new")}
                className="h-12 w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>
            </div>
          </div>

          {/* Sort Controls - Horizontal Scrollable */}
          {filteredCases.length > 0 && (
            <div className="overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 touch-pan-x">
              <div className="flex items-center gap-2 min-w-max">
                {[
                  { value: "default", label: "Default" },
                  { value: "name", label: "Name" },
                  { value: "date", label: "Date" },
                  { value: "progress", label: "Progress" },
                  { value: "mode", label: "Mode" },
                  { value: "score", label: "Score" },
                  { value: "stage", label: "Stage" },
                  { value: "pay", label: "Payment" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSortBy(option.value as any)}
                    className="whitespace-nowrap flex-shrink-0 h-10 min-w-[140px] text-base font-medium border-2"
                  >
                    {option.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => resetSortOrdersMutation.mutate()}
                  className="whitespace-nowrap flex-shrink-0 h-10 min-w-[140px] text-base font-medium border-2"
                  disabled={!cases.some(c => c.sort_order !== null)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Order
                </Button>
              </div>
            </div>
          )}
        </div>

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredCases.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCases.map((caseItem) => (
                  <DraggableCaseCard 
                    key={caseItem.id}
                    clientCase={caseItem}
                    onEdit={handleEdit}
                    onDelete={handleDeleteCase}
                    onUpdateStatus={handleUpdateStatus}
                    isFavorite={isFavorite(caseItem.id)}
                    onToggleFavorite={() => toggleFavorite(caseItem.id)}
                    isSelected={isSelected(caseItem.id)}
                    onToggleSelection={() => toggleSelection(caseItem.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
            push_scheme: editCase.push_scheme,
            is_vip: editCase.is_vip,
            notes: editCase.notes,
            progress: editCase.progress,
            client_photo_url: editCase.client_photo_url,
            start_date: editCase.start_date,
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

      <GlobalSearch
        open={showGlobalSearch}
        onOpenChange={setShowGlobalSearch}
      />

      <BulkActionsToolbar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onBulkStatusUpdate={bulkStatusUpdate}
        onBulkDelete={bulkDelete}
        onBulkExport={() => exportToCSV(cases)}
      />
      </AdminLayout>
    </ErrorBoundary>
  );
}
