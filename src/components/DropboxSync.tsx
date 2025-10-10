import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DropboxSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load last sync time from database on mount
  useEffect(() => {
    const loadLastSync = async () => {
      try {
        const { data, error } = await supabase
          .from("sync_logs")
          .select("created_at")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setLastSync(new Date(data.created_at));
        }
      } catch (error) {
        console.error("Error loading last sync:", error);
      }
    };

    loadLastSync();
  }, []);

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
    <div className="flex justify-center">
      <Button onClick={handleSync} disabled={isSyncing} size="lg">
        {isSyncing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Dropbox
          </>
        )}
      </Button>
    </div>
  );
};
