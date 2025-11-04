import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AIDocumentWorkflow } from "@/components/workflows/AIDocumentWorkflow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

const AIWorkflow = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    if (!searchTerm.trim()) return cases;
    
    const search = searchTerm.toLowerCase().trim();
    return cases.filter(c => {
      const name = (c.client_name || "").toLowerCase();
      return name.includes(search);
    });
  }, [cases, searchTerm]);

  return (
    <AdminLayout>
      <div className="space-y-8 p-8">
        {/* Search and Case Selection */}
        <div className="max-w-md space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by surname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Select Case</label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a case to run AI workflow..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCases?.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.client_name || 'Unnamed Case'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
