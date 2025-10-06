import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface Case {
  id: string;
  client_name: string;
  client_code: string;
  status: string;
  current_stage: string;
  country: string;
  progress: number;
  kpi_docs_percentage: number;
  kpi_tasks_completed: number;
  kpi_tasks_total: number;
  created_at: string;
}

export default function CasesManagement() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check in dev mode
    // checkAuth();
    loadCases();
  }, []);

  // Commented out for dev mode
  // const checkAuth = async () => {
  //   const { data: { session } } = await supabase.auth.getSession();
  //   if (!session) {
  //     navigate("/login");
  //   }
  // };

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error("Error loading cases:", error);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = (caseId: string) => {
    navigator.clipboard.writeText(caseId);
    toast.success("Case ID copied to clipboard");
  };

  const handleExport = async (caseId: string) => {
    toast.info("Exporting case data...");
    // TODO: Implement export functionality
  };

  const handlePostpone = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({ status: "on_hold" })
        .eq("id", caseId);
      
      if (error) throw error;
      toast.success("Case postponed");
      loadCases();
    } catch (error) {
      toast.error("Failed to postpone case");
    }
  };

  const handleSuspend = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({ status: "suspended" })
        .eq("id", caseId);
      
      if (error) throw error;
      toast.success("Case suspended");
      loadCases();
    } catch (error) {
      toast.error("Failed to suspend case");
    }
  };

  const handleCancel = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({ status: "failed" })
        .eq("id", caseId);
      
      if (error) throw error;
      toast.success("Case cancelled");
      loadCases();
    } catch (error) {
      toast.error("Failed to cancel case");
    }
  };

  const handleArchive = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({ status: "finished" })
        .eq("id", caseId);
      
      if (error) throw error;
      toast.success("Case archived");
      loadCases();
    } catch (error) {
      toast.error("Failed to archive case");
    }
  };

  const handleDelete = async (caseId: string) => {
    if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", caseId);
      
      if (error) throw error;
      toast.success("Case deleted");
      loadCases();
    } catch (error) {
      toast.error("Failed to delete case");
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
    c.client_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                    <Badge className={getStageColor(caseItem.current_stage)}>
                      {caseItem.current_stage.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Docs: {caseItem.kpi_docs_percentage}%
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Tasks: {caseItem.kpi_tasks_completed}/{caseItem.kpi_tasks_total}
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

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No cases found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
