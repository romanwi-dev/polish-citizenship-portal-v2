import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Database, Search, SlidersHorizontal } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DropboxSync } from "@/components/DropboxSync";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { CaseCard } from "@/components/CaseCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { CaseCardSkeletonGrid } from "@/components/CaseCardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCases, useUpdateCaseStatus, useDeleteCase } from "@/hooks/useCases";
import { STATUS_COLORS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { celebrateStatusChange, celebrateCompletion } from "@/utils/confetti";
import { ScrollToTop } from "@/components/ScrollToTop";
import { GlobalBackground } from "@/components/GlobalBackground";

interface FullscreenCase {
  id: string;
  client_name: string;
  client_code: string | null;
  country: string | null;
  status: string;
  generation: string | null;
  push_scheme: string | null;
  is_vip: boolean | null;
  start_date: string | null;
  progress: number | null;
  dropbox_path: string;
  notes: string | null;
  document_count: number;
  client_photo_url: string | null;
}

const Cases = () => {
  const [fullscreenCase, setFullscreenCase] = useState<FullscreenCase | null>(null);
  const [editCase, setEditCase] = useState<FullscreenCase | null>(null);
  const { toast } = useToast();
  
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

  const handleUpdateStatus = useCallback(async (caseId: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ caseId, status });
      
      // Celebrate status change
      if (status === 'completed' || status === 'finished') {
        celebrateCompletion();
      } else {
        celebrateStatusChange(status);
      }
      
      toast({
        title: "Status updated",
        description: `Case status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive",
      });
    }
  }, [updateStatusMutation, toast]);

  const handleDeleteCase = useCallback((caseId: string) => {
    deleteMutation.mutate(caseId);
  }, [deleteMutation]);

  const handleEdit = useCallback((clientCase: any) => {
    setEditCase(clientCase);
  }, []);

  // Calculate case age in days - memoized
  const getCaseAge = useCallback((startDate: string | null) => {
    if (!startDate) return 0;
    return Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  }, []);

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

  // Clear all filters - memoized
  const handleClearFilters = useCallback(() => {
    setStatusFilter("all");
    setProcessingModeFilter("all");
    setScoreFilter([0, 100]);
    setAgeFilter("all");
    setProgressFilter([0, 100]);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Verifying authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <GlobalBackground />
      <div className="relative z-10">
      <Navigation />
      
      <section className="relative py-16 overflow-hidden">
        <div className="px-4 md:px-8 lg:px-12 mx-auto w-full">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text mb-12 md:mb-20">
              Cases Management
            </h1>
          </div>

          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name or case code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropboxSync />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 bg-primary text-primary-foreground">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto bg-background border-border">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">Filter Cases</SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                      Apply filters to narrow down your case list
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Processing Mode Filter */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Processing Mode</Label>
                      <Select value={processingModeFilter} onValueChange={setProcessingModeFilter}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="All modes" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="all">All Modes</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="expedited">Expedited</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="vip_plus">VIP+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Client Score Filter */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Client Score: {scoreFilter[0]} - {scoreFilter[1]}</Label>
                      <Slider
                        value={scoreFilter}
                        onValueChange={(value) => setScoreFilter(value as [number, number])}
                        min={0}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {/* Case Age Filter */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Case Age</Label>
                      <Select value={ageFilter} onValueChange={setAgeFilter}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="All ages" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="new">New (0-30 days)</SelectItem>
                          <SelectItem value="recent">Recent (31-90 days)</SelectItem>
                          <SelectItem value="medium">Medium (91-180 days)</SelectItem>
                          <SelectItem value="old">Old (180+ days)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Progress Filter */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Progress: {progressFilter[0]}% - {progressFilter[1]}%</Label>
                      <Slider
                        value={progressFilter}
                        onValueChange={(value) => setProgressFilter(value as [number, number])}
                        min={0}
                        max={100}
                        step={10}
                        className="mt-2"
                      />
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={handleClearFilters}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="capitalize">
                    Status: {statusFilter.replace("_", " ")}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setStatusFilter("all")}
                    />
                  </Badge>
                )}
                {processingModeFilter !== "all" && (
                  <Badge variant="secondary" className="capitalize">
                    Mode: {processingModeFilter.replace("_", " ")}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setProcessingModeFilter("all")}
                    />
                  </Badge>
                )}
                {ageFilter !== "all" && (
                  <Badge variant="secondary">
                    Age: {ageFilter}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setAgeFilter("all")}
                    />
                  </Badge>
                )}
                {(scoreFilter[0] !== 0 || scoreFilter[1] !== 100) && (
                  <Badge variant="secondary">
                    Score: {scoreFilter[0]}-{scoreFilter[1]}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setScoreFilter([0, 100])}
                    />
                  </Badge>
                )}
                {(progressFilter[0] !== 0 || progressFilter[1] !== 100) && (
                  <Badge variant="secondary">
                    Progress: {progressFilter[0]}%-{progressFilter[1]}%
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setProgressFilter([0, 100])}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {error ? (
            <ErrorState 
              message="Failed to load cases. Please try again."
              retry={() => refetch()}
            />
          ) : loading ? (
            <CaseCardSkeletonGrid count={4} />
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
            <div className="relative max-w-7xl mx-auto">
              {/* Center line - same as homepage timeline */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

              {filteredCases.map((clientCase, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <div 
                    key={clientCase.id} 
                    className={`relative mb-16 md:mb-24 flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Content Card */}
                    <div className="w-full md:w-1/2">
                      <motion.div
                        initial={{ opacity: 0, x: isEven ? 100 : -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CaseCard 
                          clientCase={clientCase}
                          onEdit={handleEdit}
                          onDelete={handleDeleteCase}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </motion.div>
                    </div>

                    {/* Center Circle with Number - same as homepage */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                          <span className="text-2xl font-heading font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                            {index + 1}
                          </span>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl -z-10" />
                      </div>
                    </div>

                    {/* Empty space for layout balance */}
                    <div className="w-full md:w-1/2 hidden md:block" />
                  </div>
                );
              })}
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
      
      <ScrollToTop />
      </div>
    </div>
  );
};

export default Cases;
