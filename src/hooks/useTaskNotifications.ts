import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTaskNotifications = (caseId: string | undefined) => {
  useEffect(() => {
    if (!caseId) return;

    const channel = supabase
      .channel(`tasks:${caseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
          filter: `case_id=eq.${caseId}`,
        },
        (payload: any) => {
          toast.info(`New task: ${payload.new.title}`, {
            description: payload.new.description || "Click to view details",
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `case_id=eq.${caseId}`,
        },
        (payload: any) => {
          if (payload.new.status === "completed" && payload.old.status !== "completed") {
            toast.success(`Task completed: ${payload.new.title}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);
};
