// PERF-V7: Enhanced memoization for CaseCard
import { useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Edit, MoreVertical, Copy, Pause, Ban, Archive, Trash2, Eye, Radio, FileEdit, Award, Zap, Star, Edit2, FolderOpen, GitBranch } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getWorkflowForCase, getWorkflowPath, getWorkflowLabel } from "@/utils/workflowMapping";
import { CollapsibleKPIStrip } from "@/components/CollapsibleKPIStrip";
import { KPIStrip } from "@/components/KPIStrip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { STATUS_COLORS, PROCESSING_MODE_COLORS, PROCESSING_MODE_LABELS } from "@/lib/constants";
import { useUpdateProcessingMode } from "@/hooks/useCaseMutations";
import { useUpdateCase } from "@/hooks/useCases";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface CaseCardProps {
  clientCase: {
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
    processing_mode: string;
    client_score: number;
    scheme_introduced?: string;
    intake_completed?: boolean;
    poa_approved?: boolean;
    oby_filed?: boolean;
    wsc_received?: boolean;
    decision_received?: boolean;
    kpi_tasks_total?: number;
    kpi_tasks_completed?: number;
    kpi_docs_percentage?: number;
    client_photo_url?: string | null;
    current_stage?: string;
    workflow_type?: string;
    admin_notes?: string | null;
    payment_status?: string | null;
  };
  onEdit: (clientCase: any) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const CaseCard = memo(({ 
  clientCase, 
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  isFavorite, 
  onToggleFavorite,
  isSelected,
  onToggleSelection 
}: CaseCardProps) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(clientCase.client_photo_url || null);
  const [adminNotes, setAdminNotes] = useState(clientCase.admin_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showAdminNotes, setShowAdminNotes] = useState(false);
  const updateProcessingMode = useUpdateProcessingMode();
  const updateCase = useUpdateCase();
  const { user } = useAuth();
  const { data: userRole } = useUserRole(user?.id);
  const isStaff = userRole === 'admin' || userRole === 'assistant';

  // PERF-V7: Memoize status badge to prevent recalculations
  const getStatusBadge = useCallback((status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.other;
  }, []);

  const handleClick = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleDoubleClick = useCallback(() => {
    navigate(`/admin/cases/${clientCase.id}`);
    setIsFlipped(false);
  }, [navigate, clientCase.id]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(clientCase);
  }, [onEdit, clientCase]);

  const handleCopyId = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(clientCase.id);
    toast.success("Case ID copied to clipboard");
  }, [clientCase.id]);

  const handlePostpone = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "on_hold");
  }, [onUpdateStatus, clientCase.id]);

  const handleSuspend = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "suspended");
  }, [onUpdateStatus, clientCase.id]);

  const handleCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "failed");
  }, [onUpdateStatus, clientCase.id]);

  const handleArchive = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "finished");
  }, [onUpdateStatus, clientCase.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    onDelete(clientCase.id);
    setShowDeleteDialog(false);
  }, [onDelete, clientCase.id]);

  const handleSaveAdminNotes = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ admin_notes: adminNotes })
        .eq('id', clientCase.id);

      if (error) throw error;
      toast.success('Admin notes saved');
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast.error('Failed to save admin notes');
    }
  }, [adminNotes, clientCase.id]);

  const handleProcessingModeChange = useCallback((mode: string) => {
    updateProcessingMode.mutate({ caseId: clientCase.id, processingMode: mode });
  }, [updateProcessingMode, clientCase.id]);

  const handlePaymentStatusChange = useCallback((status: string) => {
    updateCase.mutate({ 
      caseId: clientCase.id, 
      updates: { payment_status: status } as any 
    });
  }, [updateCase, clientCase.id]);

  const getProcessingModeIcon = useCallback(() => {
    switch (clientCase.processing_mode) {
      case "expedited":
        return <Zap className="w-4 h-4" />;
      case "vip":
      case "vip_plus":
        return <Award className="w-4 h-4" />;
      default:
        return null;
    }
  }, [clientCase.processing_mode]);

  return (
    <div 
      className="perspective-1000 cursor-pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`relative transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d', minHeight: '750px' }}
      >
          {/* Front of Card */}
        <div className="backface-hidden border-2 border-border/50 hover:border-primary/60 transition-all shadow-lg hover:shadow-xl p-5 sm:p-6 rounded-lg flex flex-col glass-card" style={{ minHeight: '750px' }}>
          <div className="flex items-start justify-between gap-2 mb-5">
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                {clientCase.client_name}
              </h3>
              {clientCase.client_code && (
                <p className="text-sm text-muted-foreground mt-1 font-mono truncate">
                  {clientCase.client_code}
                </p>
              )}
            </div>
            <div className={`flex items-center gap-2 shrink-0 ${isFlipped ? 'opacity-0 pointer-events-none' : ''}`}>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Case options menu">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border z-50">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyId}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePostpone}>
                    <Pause className="mr-2 h-4 w-4" />
                    Postpone
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSuspend}>
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-5 sm:flex-nowrap">
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize whitespace-nowrap min-h-[28px] flex items-center justify-center sm:min-w-[85px] min-w-[85px]`}>
              {clientCase.status.replace(/_/g, ' ')}
            </span>
            
            {clientCase.country && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30 whitespace-nowrap min-h-[28px] flex items-center justify-center sm:min-w-[85px] min-w-[85px]">
                {clientCase.country}
              </span>
            )}
            
            {/* Processing Mode Badge with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center whitespace-nowrap min-h-[28px] sm:min-w-[85px] min-w-[85px] ${
                  PROCESSING_MODE_COLORS[clientCase.processing_mode as keyof typeof PROCESSING_MODE_COLORS]
                }`}>
                  {PROCESSING_MODE_LABELS[clientCase.processing_mode as keyof typeof PROCESSING_MODE_LABELS]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-popover border border-border z-50">
                <DropdownMenuLabel>Processing Mode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProcessingModeChange('standard'); }}>
                  Standard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProcessingModeChange('expedited'); }}>
                  <Zap className="mr-2 h-4 w-4" />
                  Expedited
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProcessingModeChange('vip'); }}>
                  <Award className="mr-2 h-4 w-4" />
                  VIP
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProcessingModeChange('vip_plus'); }}>
                  <Award className="mr-2 h-4 w-4" />
                  VIP+
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Payment Status Badge with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center whitespace-nowrap min-h-[28px] sm:min-w-[85px] min-w-[85px] ${
                  clientCase.payment_status === 'clear' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {clientCase.payment_status === 'clear' ? 'Clear' : 'Pay'}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-popover border border-border z-50">
                <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePaymentStatusChange('pay'); }}>
                  Pay
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePaymentStatusChange('clear'); }}>
                  Clear
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {clientCase.scheme_introduced && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-cyan-500/20 text-cyan-400 border-cyan-500/30 whitespace-nowrap min-h-[28px] flex items-center justify-center sm:min-w-[85px] min-w-[85px]">
                {clientCase.scheme_introduced}
              </span>
            )}
          </div>

          {/* KPI Strip - Mobile Optimized with Clickable Navigation */}
          <div className="mb-4 sm:mb-5">
            <KPIStrip
              intakeCompleted={Boolean(clientCase.intake_completed)}
              poaApproved={Boolean(clientCase.poa_approved)}
              obyFiled={Boolean(clientCase.oby_filed)}
              wscReceived={Boolean(clientCase.wsc_received)}
              decisionReceived={Boolean(clientCase.decision_received)}
              docsPercentage={clientCase.kpi_docs_percentage || 0}
              tasksCompleted={clientCase.kpi_tasks_completed || 0}
              tasksTotal={clientCase.kpi_tasks_total || 0}
              caseId={clientCase.id}
            />
          </div>


          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
            <div className="flex flex-col gap-1 p-3 rounded-lg border border-border/20">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-xs sm:text-sm font-normal font-label text-muted-foreground">Started</p>
              </div>
              <p className="text-sm sm:text-base font-normal font-label mt-1">
                {clientCase.start_date ? new Date(clientCase.start_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg border border-border/20">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-secondary" />
                <p className="text-xs sm:text-sm font-normal font-label text-muted-foreground">Docs</p>
              </div>
              <p className="text-sm sm:text-base font-bold font-label mt-1 text-cyan-400">{clientCase.document_count}</p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg border border-border/20">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                <p className="text-xs sm:text-sm font-normal font-label text-muted-foreground">Score</p>
              </div>
              <p className="text-sm sm:text-base font-bold font-label mt-1 text-cyan-400">{clientCase.client_score || 0}</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
            <div className="flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="font-normal font-label text-muted-foreground text-sm sm:text-base">Progress</span>
              </div>
              <span className="font-bold text-base sm:text-lg text-cyan-400">{clientCase.progress || 0}%</span>
            </div>
            <div className="h-3 border border-border/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary/80 to-accent/80 transition-all duration-500 rounded-full"
                style={{ width: `${clientCase.progress || 0}%` }}
              />
            </div>
          </div>

          {clientCase.status === "finished" && (
            <div className="mb-5 sm:mb-6 flex items-center justify-center gap-2 p-4 rounded-lg border border-green-500/30">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm sm:text-base font-medium text-green-400">Citizenship Granted</span>
            </div>
          )}

          {!isFlipped && (
            <div className="space-y-2 mt-auto pt-5 sm:pt-5">
              {/* Control Room Button - Premium Feature */}
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-primary/50 dark:border-primary/20 h-12 perspective-1000 group relative overflow-hidden preserve-3d transition-all duration-300 hover:scale-[1.02] bg-primary/20 dark:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}`);
                }}
              >
                <span className="text-sm font-medium text-foreground/70 dark:text-foreground/40 group-hover:text-foreground/90 dark:group-hover:text-foreground/60 transition-colors relative z-10">
                  Control Room
                </span>
              </Button>

              {/* AI Documents Workflow Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-primary/50 dark:border-primary/20 h-12 perspective-1000 group relative overflow-hidden preserve-3d transition-all duration-300 hover:scale-[1.02] bg-primary/20 dark:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/ai-workflow?caseId=${clientCase.id}`);
                }}
              >
                <span className="text-sm font-medium text-foreground/70 dark:text-foreground/40 group-hover:text-foreground/90 dark:group-hover:text-foreground/60 transition-colors relative z-10">
                  AI Documents
                </span>
              </Button>

              {/* Case Workflow Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-primary/50 dark:border-primary/20 h-12 perspective-1000 group relative overflow-hidden preserve-3d transition-all duration-300 hover:scale-[1.02] bg-primary/20 dark:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  const workflowType = getWorkflowForCase({
                    workflow_type: clientCase.workflow_type,
                    current_stage: clientCase.current_stage,
                    status: clientCase.status,
                    decision_received: clientCase.decision_received,
                    oby_filed: clientCase.oby_filed
                  });
                  navigate(getWorkflowPath(workflowType));
                }}
              >
                <span className="text-sm font-medium text-foreground/70 dark:text-foreground/40 group-hover:text-foreground/90 dark:group-hover:text-foreground/60 transition-colors relative z-10">
                  Case Workflow
                </span>
              </Button>

              {/* Action Buttons - 2 rows of 3 */}
              <div className="grid grid-cols-3 gap-2">
                {/* 1st Row: Intake - Family Tree - Ask AI */}
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-primary/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-primary/10 dark:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/intake/${clientCase.id}`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Intake
                  </span>
                </Button>
                
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-primary/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-primary/10 dark:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/family-tree/${clientCase.id}`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Family Tree
                  </span>
                </Button>
                
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-primary/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-primary/10 dark:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${clientCase.id}?tab=ai-agent`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Ask AI
                  </span>
                </Button>
                
                {/* 2nd Row: Upload - Documents - Stage */}
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-primary/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-primary/10 dark:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${clientCase.id}?tab=authority`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Upload
                  </span>
                </Button>
                
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-primary/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-primary/10 dark:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${clientCase.id}?tab=documents`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Documents
                  </span>
                </Button>
                
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-primary/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-primary/10 dark:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${clientCase.id}?tab=stage`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Stage
                  </span>
                </Button>
                
                {/* Interactive Family Tree Button */}
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-emerald-500/50 dark:border-emerald-500/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-500/5 col-span-3 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/family-tree-view/${clientCase.id}`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Interactive Tree
                  </span>
                </Button>

                {/* Dropbox Folder Button */}
                <Button
                  size="sm"
                  className="text-xs font-light group relative overflow-hidden backdrop-blur-md border-2 border-emerald-500/50 dark:border-emerald-500/20 h-11 flex items-center justify-center px-4 whitespace-nowrap bg-emerald-500/10 dark:bg-emerald-500/5 col-span-3 transition-all duration-300 hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (clientCase.dropbox_path) {
                      window.open(`https://www.dropbox.com/home${clientCase.dropbox_path}`, '_blank');
                    } else {
                      toast.error('No Dropbox path configured for this case');
                    }
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                    Dropbox Folder
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 border-2 border-primary/60 shadow-lg p-6 rounded-lg glass-card"
          style={{ transform: 'rotateY(180deg)', minHeight: '750px' }}
        >
          <div className="h-full flex flex-col" style={{ minHeight: '580px' }}>
            <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {clientCase.client_name.split(' ').pop() || clientCase.client_name}
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {clientCase.client_code && (
              <div className="p-3 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Case Reference</p>
                <p className="font-bold text-lg text-cyan-400">{clientCase.client_code}</p>
              </div>
              )}

              {clientCase.start_date && (
                <div className="p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Timeline</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-secondary" />
                      Days Active
                    </span>
                    <span className="text-sm font-bold text-cyan-400">
                      {Math.floor((Date.now() - new Date(clientCase.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              )}

              {clientCase.notes && (
                <div className="p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
                  <p className="text-sm leading-relaxed">{clientCase.notes}</p>
                </div>
              )}

              {isStaff && (
                <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <Edit2 className="w-3 h-3" />
                      Admin Notes
                    </p>
                    {isEditingNotes ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveAdminNotes();
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdminNotes(clientCase.admin_notes || '');
                            setIsEditingNotes(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingNotes(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-sm min-h-[60px] bg-background/50"
                      placeholder="Add private notes visible only to staff..."
                    />
                  ) : (
                    <p 
                      className={cn(
                        "text-sm leading-relaxed text-muted-foreground select-none cursor-pointer transition-all",
                        !showAdminNotes && "blur-sm"
                      )}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setShowAdminNotes(true);
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        setShowAdminNotes(false);
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        setShowAdminNotes(false);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setShowAdminNotes(true);
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        setShowAdminNotes(false);
                      }}
                    >
                      {adminNotes || 'No admin notes yet...'}
                    </p>
                  )}
                </div>
              )}

              {clientCase.status === "finished" && (
                <div className="p-3 rounded-lg border border-green-500/40">
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this case? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

CaseCard.displayName = "CaseCard";
