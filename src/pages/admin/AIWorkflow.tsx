import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AIDocumentWorkflow } from "@/components/workflows/AIDocumentWorkflow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AIWorkflow = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  const { data: cases } = useQuery({
    queryKey: ['cases-for-workflow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, client_name, client_code')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <AdminLayout>
      <div className="space-y-8 p-8">
        {/* Case Selection */}
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-2">Select Case</label>
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a case to run AI workflow..." />
            </SelectTrigger>
            <SelectContent>
              {cases?.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.client_code} - {c.client_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workflow Component */}
        {selectedCaseId && (
          <AIDocumentWorkflow caseId={selectedCaseId} />
        )}
      </div>
    </AdminLayout>
  );
};

export default AIWorkflow;
