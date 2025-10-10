import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FolderSync, Undo2, Play, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MigrationChange {
  case_id: string;
  client_name: string;
  current_path: string;
  proposed_path: string;
  reason: string;
}

interface MigrationPlan {
  total_cases: number;
  affected_cases: number;
  changes: MigrationChange[];
}

export default function DropboxMigration() {
  const [dryRun, setDryRun] = useState(true);
  const queryClient = useQueryClient();

  // Fetch migration plan
  const { data: migrationPlan, isLoading: planLoading } = useQuery<MigrationPlan>({
    queryKey: ["migration-plan"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dropbox-migration-scan", {
        body: { dryRun: true },
      });
      if (error) throw error;
      return data;
    },
  });

  // Execute migration
  const executeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("dropbox-migration-scan", {
        body: { dryRun: false },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Migration executed successfully");
      queryClient.invalidateQueries({ queryKey: ["migration-plan"] });
      queryClient.invalidateQueries({ queryKey: ["migration-logs"] });
    },
    onError: (error: Error) => {
      toast.error(`Migration failed: ${error.message}`);
    },
  });

  // Fetch migration logs
  const { data: migrationLogs } = useQuery({
    queryKey: ["migration-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("migration_logs")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Undo last migration
  const undoMutation = useMutation({
    mutationFn: async (migrationId: string) => {
      const { data, error } = await supabase.functions.invoke("dropbox-migration-scan", {
        body: { undo: migrationId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Migration undone successfully");
      queryClient.invalidateQueries({ queryKey: ["migration-plan"] });
      queryClient.invalidateQueries({ queryKey: ["migration-logs"] });
    },
    onError: (error: Error) => {
      toast.error(`Undo failed: ${error.message}`);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dropbox Migration Scanner</h1>
          <p className="text-muted-foreground">
            Scan and fix naming inconsistencies in Dropbox /CASES folder
          </p>
        </div>
        <FolderSync className="h-10 w-10 text-primary" />
      </div>

      {/* Migration Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Plan</CardTitle>
          <CardDescription>
            Proposed changes to align Dropbox folders with database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {planLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : migrationPlan ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{migrationPlan.total_cases}</p>
                  <p className="text-sm text-muted-foreground">Total Cases</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{migrationPlan.affected_cases}</p>
                  <p className="text-sm text-muted-foreground">Affected Cases</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{migrationPlan.changes?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Changes Required</p>
                </div>
              </div>

              {migrationPlan.changes && migrationPlan.changes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Proposed Changes:</h3>
                  {migrationPlan.changes.map((change, idx) => (
                    <Alert key={idx}>
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">{change.client_name}</p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">From:</span>{" "}
                            <code className="bg-muted px-1 rounded">{change.current_path}</code>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">To:</span>{" "}
                            <code className="bg-muted px-1 rounded">{change.proposed_path}</code>
                          </p>
                          <p className="text-xs text-muted-foreground">{change.reason}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => executeMutation.mutate()}
                  disabled={executeMutation.isPending || !migrationPlan.changes?.length}
                  className="gap-2"
                >
                  {executeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Execute Migration
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No migration plan available</p>
          )}
        </CardContent>
      </Card>

      {/* Migration History */}
      <Card>
        <CardHeader>
          <CardTitle>Migration History</CardTitle>
          <CardDescription>Recent migration executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {migrationLogs?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <p className="font-medium">{log.migration_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.executed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={log.status === "completed" ? "default" : "destructive"}>
                    {log.status}
                  </Badge>
                  {log.can_undo && !log.undone_at && log.status === "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => undoMutation.mutate(log.id)}
                      disabled={undoMutation.isPending}
                      className="gap-2"
                    >
                      <Undo2 className="h-3 w-3" />
                      Undo
                    </Button>
                  )}
                  {log.undone_at && (
                    <Badge variant="outline">Undone</Badge>
                  )}
                </div>
              </div>
            ))}
            {!migrationLogs?.length && (
              <p className="text-center text-muted-foreground py-4">No migration history</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
