import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toastSuccess, toastError } from "@/utils/toastNotifications";

export const useDocumentUploadToasts = (caseId: string | undefined) => {
  useEffect(() => {
    if (!caseId) return;

    const channel = supabase
      .channel(`documents:${caseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "documents",
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          toastSuccess.documentUploaded();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "documents",
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          toastSuccess.documentDeleted();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);
};
