import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Edit, MoreVertical, Copy, Pause, Ban, Archive, Trash2, Eye, Radio, FileEdit, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  };
  onEdit: (clientCase: any) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const CaseCard = memo(({ clientCase, onEdit, onDelete, onUpdateStatus }: CaseCardProps) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      className="perspective-1000 cursor-pointer h-[520px]"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden glass-card p-6 rounded-lg hover-glow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {clientCase.client_name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {clientCase.country || 'N/A'}
                </div>
              </div>
            </div>
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

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize`}>
              {clientCase.status.replace(/_/g, ' ')}
            </span>
            
            {/* Processing Mode Badge with Dropdown - no VIP badge if VIP mode */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${
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

            {clientCase.scheme_introduced && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {clientCase.scheme_introduced}
              </span>
            )}
          </div>

          {clientCase.client_code && (
            <div className="mb-4 p-2 rounded-lg bg-background/30">
              <p className="text-xs text-muted-foreground">Case Code</p>
              <p className="text-sm font-mono">{clientCase.client_code}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/30">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">Started</p>
              </div>
              <p className="text-sm font-medium mt-1">
                {clientCase.start_date ? new Date(clientCase.start_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/30">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-secondary" />
                <p className="text-xs text-muted-foreground">Docs</p>
              </div>
              <p className="text-sm font-medium mt-1">{clientCase.document_count}</p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/30">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <p className="text-sm font-medium mt-1">{clientCase.client_score || 0}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Progress</span>
              </div>
              <span className="font-bold text-lg">{clientCase.progress || 0}%</span>
            </div>
            <div className="h-3 bg-background/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                style={{ width: `${clientCase.progress || 0}%` }}
              />
            </div>
          </div>

          {clientCase.status === "finished" && (
            <div className="mb-6 flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-base font-medium text-green-400">Citizenship Granted</span>
            </div>
          )}

          <div className="space-y-3 mt-auto">
            {/* Control Room Button - Premium Feature */}
            <Button
              size="default"
              className="w-full text-sm font-bold bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-blue-500/30 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border-2 border-primary/50 h-14"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/cases/${clientCase.id}`);
              }}
            >
              <span className="relative z-10 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-base text-center w-full">
                CONTROL ROOM
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>

            {/* Action Buttons - 2 rows of 3 */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/30">
              <Button
                size="default"
                className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}`);
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
                  navigate(`/admin/cases/${clientCase.id}?tab=documents`);
                }}
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                  Documents
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                size="default"
                className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}?tab=tasks`);
                }}
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                  Tasks
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button
                size="default"
                className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}?tab=authority`);
                }}
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                  Authority
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button
                size="default"
                className="text-sm font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 h-12 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}?tab=stage`);
                }}
              >
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center justify-center w-full">
                  Stage
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
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

              <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Processing Mode</p>
                <p className="font-bold text-base capitalize">{PROCESSING_MODE_LABELS[clientCase.processing_mode as keyof typeof PROCESSING_MODE_LABELS]}</p>
              </div>

              {clientCase.scheme_introduced && (
                <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Scheme Introduced</p>
                  <p className="font-bold text-base">{clientCase.scheme_introduced}</p>
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
                      <span className="text-xs font-bold">
                        {Math.floor((Date.now() - new Date(clientCase.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-accent" />
                      Completion
                    </span>
                    <span className="text-xs font-bold text-primary">{clientCase.progress || 0}%</span>
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
                  <span className="text-xl font-bold text-primary">{clientCase.document_count}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <p className="font-bold text-base">{clientCase.country || 'N/A'}</p>
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

CaseCard.displayName = "CaseCard";
