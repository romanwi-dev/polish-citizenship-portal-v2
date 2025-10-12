import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useBulkCaseActions = () => {
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const toggleSelection = (caseId: string) => {
    setSelectedCaseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  };

  const selectAll = (caseIds: string[]) => {
    setSelectedCaseIds(new Set(caseIds));
  };

  const clearSelection = () => {
    setSelectedCaseIds(new Set());
  };

  const bulkStatusUpdate = async (status: string) => {
    const ids = Array.from(selectedCaseIds);
    
    const { error } = await supabase
      .from("cases")
      .update({ status: status as any })
      .in("id", ids);

    if (error) throw error;
    
    await queryClient.invalidateQueries({ queryKey: ["cases"] });
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedCaseIds);
    
    const { error } = await supabase
      .from("cases")
      .delete()
      .in("id", ids);

    if (error) throw error;
    
    await queryClient.invalidateQueries({ queryKey: ["cases"] });
  };

  const exportToCSV = (cases: any[]) => {
    const selectedCases = cases.filter((c) => selectedCaseIds.has(c.id));
    
    const headers = ["Name", "Code", "Country", "Status", "Progress", "Documents", "Score"];
    const rows = selectedCases.map((c) => [
      c.client_name,
      c.client_code || "",
      c.country || "",
      c.status,
      c.progress || 0,
      c.document_count,
      c.client_score || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cases-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    selectedCaseIds,
    selectedCount: selectedCaseIds.size,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkStatusUpdate,
    bulkDelete,
    exportToCSV,
    isSelected: (id: string) => selectedCaseIds.has(id),
  };
};
