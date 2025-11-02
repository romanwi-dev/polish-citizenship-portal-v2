import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

export default function OCRSystemHealth() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["ocr-system-health"],
    queryFn: async () => {
      const { data: documents, error } = await supabase
        .from("documents")
        .select("ocr_status, ocr_retry_count");

      if (error) throw error;

      const statusCounts = documents?.reduce((acc, doc) => {
        acc[doc.ocr_status || "null"] = (acc[doc.ocr_status || "null"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const failedWithRetries = documents?.filter(
        (d) => d.ocr_status === "failed" && (d.ocr_retry_count || 0) >= 3
      ).length || 0;

      return {
        queued: statusCounts["queued"] || 0,
        processing: statusCounts["processing"] || 0,
        completed: statusCounts["completed"] || 0,
        failed: statusCounts["failed"] || 0,
        needs_review: statusCounts["needs_review"] || 0,
        pending: statusCounts["pending"] || 0,
        total: documents?.length || 0,
        failedWithRetries,
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">OCR System Health</h1>
          <div className="animate-pulse">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">OCR System Health</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of the automated OCR processing system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Queued</p>
                <p className="text-3xl font-bold">{stats?.queued || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Waiting for OCR worker
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold">{stats?.processing || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Currently being processed
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{stats?.completed || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Successfully processed
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold">{stats?.failed || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.failedWithRetries || 0} max retries reached
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-semibold">System Overview</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Documents</span>
              <Badge variant="outline">{stats?.total || 0}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Needs Review</span>
              <Badge variant={stats?.needs_review ? "destructive" : "outline"}>
                {stats?.needs_review || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Still Pending (Legacy)</span>
              <Badge variant={stats?.pending ? "secondary" : "outline"}>
                {stats?.pending || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Success Rate</span>
              <Badge variant="default">
                {stats?.total
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </Badge>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>OCR Worker:</strong> Runs every 5 minutes via cron job
                <br />
                <strong>Batch Size:</strong> Up to 5 documents per run
                <br />
                <strong>Max Retries:</strong> 3 attempts per document
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
