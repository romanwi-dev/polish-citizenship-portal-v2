import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Eye,
  Settings,
  Database
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

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: "bg-muted",
      intake: "bg-blue-500",
      poa: "bg-purple-500",
      oby_draft: "bg-yellow-500",
      oby_filed: "bg-orange-500",
      wsc_letter: "bg-pink-500",
      authority_review: "bg-indigo-500",
      decision: "bg-green-500",
      consulate: "bg-teal-500",
    };
    return colors[stage] || "bg-muted";
  };

  const filteredCases = cases.filter(c =>
    c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.client_code && c.client_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cases Management</h1>
            <p className="text-muted-foreground">Manage all client cases</p>
          </div>
          <Button onClick={() => navigate("/admin/cases/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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
              className="p-6 hover-glow transition-all"
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/admin/cases/${caseItem.id}`)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{caseItem.client_name}</h3>
                    {caseItem.client_code && (
                      <Badge variant="outline">{caseItem.client_code}</Badge>
                    )}
                    <Badge className="bg-primary">
                      {caseItem.status.replace("_", " ").toUpperCase()}
                    </Badge>
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
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${caseItem.id}`);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${caseItem.id}`);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Control Room
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/cases/${caseItem.id}?tab=oby`);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Draft OBY
                </Button>
              </div>
            </Card>
          ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
