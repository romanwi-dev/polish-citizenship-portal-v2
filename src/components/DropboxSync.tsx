import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw, Database, CheckCircle2, AlertCircle } from "lucide-react";

export const DropboxSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info("Starting Dropbox sync...");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dropbox-sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ syncType: "full" }),
        }
      );

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      const result = await response.json();
      setLastSync(new Date());
      
      toast.success(
        `Sync completed! ${result.processed} cases processed${result.failed > 0 ? `, ${result.failed} failed` : ""}`,
        {
          description: "All cases have been synchronized with Dropbox",
        }
      );
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Sync failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dropbox Synchronization
        </CardTitle>
        <CardDescription>
          Sync your cases and documents with Dropbox storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Last Sync</p>
            <p className="text-sm text-muted-foreground">
              {lastSync ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {lastSync.toLocaleString()}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Never synced
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleSync} disabled={isSyncing} size="lg">
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          This will scan your Dropbox /CASES folder and import all client cases and documents
          into the database. Existing cases will be updated.
        </p>
      </CardContent>
    </Card>
  );
};
