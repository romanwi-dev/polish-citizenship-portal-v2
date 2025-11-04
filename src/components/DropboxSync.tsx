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
    toast.info("Starting complete Dropbox resync from scratch...");

    try {
      const { data: result, error } = await supabase.functions.invoke('dropbox-resync');

      if (error) {
        throw new Error(error.message || "Resync failed");
      }
      setLastSync(new Date());
      
      toast.success(
        `Resync completed! ${result.casesUpdated} cases & ${result.documentsUpdated} documents updated`,
        {
          description: result.casesNotFound?.length > 0 
            ? `${result.casesNotFound.length} folders not matched to cases`
            : "All cases remapped successfully",
        }
      );
    } catch (error) {
      console.error("Resync error:", error);
      toast.error("Resync failed", {
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
            Resyncing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Complete Resync
          </>
        )}
      </Button>
    </div>
  );
};
