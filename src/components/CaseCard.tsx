import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp, X, Clock, Edit, MoreVertical, Copy, Pause, Ban, Archive, Trash2, Eye, Radio, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  };
  onEdit: (clientCase: any) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const CaseCard = memo(({ clientCase, onEdit, onDelete, onUpdateStatus }: CaseCardProps) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    return statusColorMap[status] || statusColorMap.other;
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
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize flex-shrink-0`}>
                  {clientCase.status.replace(/_/g, ' ')}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
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
              {clientCase.is_vip && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
                  VIP
                </span>
              )}
            </div>
          </div>

          {clientCase.generation && (
            <div className="mb-4 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground mb-1">Generation</p>
              <p className="text-sm font-medium capitalize">{clientCase.generation}</p>
            </div>
          )}

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
                <p className="text-sm font-medium">
                  {clientCase.start_date ? new Date(clientCase.start_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
              <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="text-sm font-medium">{clientCase.document_count}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Progress</span>
              </div>
              <span className="font-bold">{clientCase.progress || 0}%</span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                style={{ width: `${clientCase.progress || 0}%` }}
              />
            </div>
          </div>

          {clientCase.status === "finished" && (
            <div className="mb-4 flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Citizenship Granted</span>
            </div>
          )}

          <div className="space-y-2 mt-auto">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}`);
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}?tab=control`);
                }}
              >
                <Radio className="w-3 h-3 mr-1" />
                Control
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/cases/${clientCase.id}?tab=oby`);
                }}
              >
                <FileEdit className="w-3 h-3 mr-1" />
                OBY
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
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
