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
      <div className="space-y-12 p-4 md:p-8">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
          Documents Workflow
        </h1>

        {/* Case Selection - Simple and Clean */}
        <div className="max-w-2xl mx-auto">
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger className="h-16 text-xl">
              <SelectValue placeholder="Choose a case to begin" />
            </SelectTrigger>
            <SelectContent>
              {cases?.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-lg">
                  {c.client_name || 'Unnamed Case'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workflow Component */}
        {selectedCaseId && <AIDocumentWorkflow caseId={selectedCaseId} />}
      </div>
    </AdminLayout>
  );
};

export default AIWorkflow;
