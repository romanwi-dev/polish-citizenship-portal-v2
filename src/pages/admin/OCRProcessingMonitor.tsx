import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

export default function OCRProcessingMonitor() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["ocr-processing-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ocr_processing_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const stats = {
    active: logs?.filter(l => l.status === 'processing').length || 0,
    completed: logs?.filter(l => l.status === 'completed').length || 0,
    failed: logs?.filter(l => l.status === 'failed').length || 0,
    avgTime: logs?.filter(l => l.processing_duration_ms).reduce((sum, l) => sum + (l.processing_duration_ms || 0), 0) / (logs?.filter(l => l.processing_duration_ms).length || 1) || 0,
    allDeleted: logs?.every(l => l.image_deleted_at !== null) || true,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OCR Processing Monitor</h1>
        <p className="text-muted-foreground">Real-time monitoring of OCR operations and security compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Avg Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgTime / 1000)}s</div>
          </CardContent>
        </Card>

        <Card className={stats.allDeleted ? "border-green-500" : "border-red-500"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.allDeleted ? '100%' : 'ALERT'}</div>
            <p className="text-xs text-muted-foreground">Images deleted</p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Recent OCR Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-2">
              {logs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{log.document_id?.slice(0, 8)}...</span>
                      <Badge variant={
                        log.status === 'completed' ? 'default' :
                        log.status === 'processing' ? 'secondary' :
                        'destructive'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Started: {format(new Date(log.started_at), 'HH:mm:ss')}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {log.processing_duration_ms && (
                      <span className="text-muted-foreground">
                        {Math.round(log.processing_duration_ms / 1000)}s
                      </span>
                    )}
                    {log.memory_used_mb && (
                      <span className="text-muted-foreground">
                        {log.memory_used_mb.toFixed(1)} MB
                      </span>
                    )}
                    {log.image_deleted_at ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Deleted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500 font-medium">Not deleted!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}