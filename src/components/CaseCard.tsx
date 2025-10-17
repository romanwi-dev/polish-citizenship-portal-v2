import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Edit, MoreVertical, Copy, Pause, Ban, Archive, Trash2, Eye, Radio, FileEdit, Award, Zap, Star } from "lucide-react";
import { getWorkflowForCase, getWorkflowPath, getWorkflowLabel } from "@/utils/workflowMapping";
import { CollapsibleKPIStrip } from "@/components/CollapsibleKPIStrip";
import { KPIStrip } from "@/components/KPIStrip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ClientPhotoUpload } from "@/components/ClientPhotoUpload";
import { STATUS_COLORS, PROCESSING_MODE_COLORS, PROCESSING_MODE_LABELS } from "@/lib/constants";
import { useUpdateProcessingMode } from "@/hooks/useCaseMutations";
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
  const updateProcessingMode = useUpdateProcessingMode();

  const getStatusBadge = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.other;
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDoubleClick = () => {
    navigate(`/admin/cases/${clientCase.id}`);
    setIsFlipped(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(clientCase);
  };

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(clientCase.id);
    toast.success("Case ID copied to clipboard");
  };

  const handlePostpone = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "on_hold");
  };

  const handleSuspend = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "suspended");
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "failed");
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(clientCase.id, "finished");
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(clientCase.id);
    setShowDeleteDialog(false);
  };

  const handleProcessingModeChange = (mode: string) => {
    updateProcessingMode.mutate({ caseId: clientCase.id, processingMode: mode });
  };

  const getProcessingModeIcon = () => {
    switch (clientCase.processing_mode) {
      case "expedited":
        return <Zap className="w-3 h-3" />;
      case "vip":
      case "vip_plus":
        return <Award className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="perspective-1000 cursor-pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`relative w-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d', minHeight: '750px' }}
      >
          {/* Front of Card */}
        <div className="absolute inset-0 w-full backface-hidden border border-border hover:border-primary/50 transition-colors p-5 sm:p-6 rounded-lg flex flex-col bg-card/80 dark:bg-card/40" style={{ minHeight: '750px' }}>
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 shrink-0">
                <ClientPhotoUpload
                  caseId={clientCase.id}
                  currentPhotoUrl={photoUrl}
                  clientName={clientCase.client_name}
                  onPhotoUpdated={setPhotoUrl}
                />
              </div>
                <div>
                <h3 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {clientCase.client_name}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize whitespace-nowrap min-h-[28px] flex items-center justify-center`}>
              {clientCase.status.replace(/_/g, ' ')}
            </span>
            
            {clientCase.is_vip && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30 whitespace-nowrap min-h-[28px] flex items-center justify-center">
                VIP
              </span>
            )}

            {clientCase.country && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30 whitespace-nowrap min-h-[28px] flex items-center justify-center">
                <MapPin className="w-3 h-3 mr-1" />
                {clientCase.country}
              </span>
            )}
            
            {/* Processing Mode Badge - Only show if NOT VIP (to avoid duplication) */}
            {!clientCase.is_vip && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 whitespace-nowrap min-h-[28px] ${
                    PROCESSING_MODE_COLORS[clientCase.processing_mode as keyof typeof PROCESSING_MODE_COLORS]
                  }`}>
                    {getProcessingModeIcon()}
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
                    <Zap className="mr-2 h-3 w-3" />
                    Expedited
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProcessingModeChange('vip'); }}>
                    <Award className="mr-2 h-3 w-3" />
                    VIP
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProcessingModeChange('vip_plus'); }}>
                    <Award className="mr-2 h-3 w-3" />
                    VIP+
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {clientCase.scheme_introduced && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-cyan-500/20 text-cyan-400 border-cyan-500/30 whitespace-nowrap min-h-[28px] flex items-center justify-center">
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
            <div className="space-y-3 sm:space-y-4 mt-auto pt-5 sm:pt-5">
              {/* Control Room Button - Premium Feature */}
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-primary/50 dark:border-primary/20 h-12 perspective-1000 group relative overflow-hidden preserve-3d transition-all duration-300 hover:scale-105 bg-primary/10 dark:bg-primary/5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}`);
                }}
              >
                <span className="text-sm font-medium text-foreground/70 dark:text-foreground/40 group-hover:text-foreground/90 dark:group-hover:text-foreground/60 transition-colors relative z-10">
                  CONTROL ROOM
                </span>
              </Button>

              {/* Case Workflow Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-secondary/50 dark:border-secondary/20 h-12 perspective-1000 group relative overflow-hidden preserve-3d transition-all duration-300 hover:scale-105 bg-secondary/10 dark:bg-secondary/5"
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
                  CASE WORKFLOW
                </span>
              </Button>

              {/* Action Buttons - 2 rows of 3 */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/30">
                <Button
                  size="sm"
                  className="text-xs font-light hover-glow group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-white/30 min-h-[44px] flex items-center justify-center bg-primary/5 dark:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${clientCase.id}?tab=ai-agent`);
                  }}
                >
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full font-medium">
                    Ask AI
                  </span>
                </Button>
                <Button
                  size="sm"
                  className="text-xs font-light hover-glow group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-white/30 min-h-[44px] flex items-center justify-center bg-primary/5 dark:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/family-tree.pdf', '_blank');
                    }}
                  >
                    <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full font-medium">
                      Family Tree
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-light hover-glow group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-white/30 min-h-[44px] flex items-center justify-center px-3 whitespace-nowrap flex-shrink-0 bg-primary/5 dark:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/cases/${clientCase.id}?tab=documents`);
                    }}
                  >
                    <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full font-medium">
                      Documents
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-light hover-glow group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-white/30 min-h-[44px] flex items-center justify-center px-3 whitespace-nowrap flex-shrink-0 bg-primary/5 dark:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/cases/${clientCase.id}?tab=tasks`);
                    }}
                  >
                    <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full font-medium">
                      Intake
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-light hover-glow group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-white/30 min-h-[44px] flex items-center justify-center px-3 whitespace-nowrap flex-shrink-0 bg-primary/5 dark:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/cases/${clientCase.id}?tab=authority`);
                    }}
                  >
                    <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full font-medium">
                      Upload
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-light hover-glow group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 dark:border-white/30 min-h-[44px] flex items-center justify-center px-3 whitespace-nowrap flex-shrink-0 bg-primary/5 dark:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/cases/${clientCase.id}?tab=stage`);
                    }}
                  >
                    <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full font-medium">
                      Stage
                    </span>
                  </Button>
                </div>
            </div>
          )}
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 w-full backface-hidden rotate-y-180 border border-primary p-6 rounded-lg"
          style={{ transform: 'rotateY(180deg)', minHeight: '750px' }}
        >
          <div className="h-full flex flex-col" style={{ minHeight: '580px' }}>
            <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Case Details
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {clientCase.client_code && (
              <div className="p-3 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Case Reference</p>
                <p className="font-bold text-lg text-cyan-400">{clientCase.client_code}</p>
              </div>
              )}

              <div className="p-3 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Processing Mode</p>
                <p className="font-bold text-base capitalize">{PROCESSING_MODE_LABELS[clientCase.processing_mode as keyof typeof PROCESSING_MODE_LABELS]}</p>
              </div>

              {clientCase.scheme_introduced && (
                <div className="p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Scheme Introduced</p>
                  <p className="font-bold text-base">{clientCase.scheme_introduced}</p>
                </div>
              )}

              <div className="p-3 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Timeline Details</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-xs flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-primary" />
                      Started
                    </span>
                    <span className="text-xs font-bold">
                      {clientCase.start_date ? new Date(clientCase.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  {clientCase.start_date && (
                    <div className="flex justify-between items-center py-1 border-b border-border/30">
                      <span className="text-xs flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-secondary" />
                        Days Active
                      </span>
                      <span className="text-xs font-bold text-cyan-400">
                        {Math.floor((Date.now() - new Date(clientCase.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-accent" />
                      Completion
                    </span>
                    <span className="text-xs font-bold text-cyan-400">{clientCase.progress || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Documents Status</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <span className="text-xs">Total Submitted</span>
                  </div>
                  <span className="text-xl font-bold text-cyan-400">{clientCase.document_count}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <p className="font-bold text-base">{clientCase.country || 'N/A'}</p>
                </div>
              </div>

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
