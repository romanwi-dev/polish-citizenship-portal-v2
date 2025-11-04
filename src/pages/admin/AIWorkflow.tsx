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
        {/* Search and Case Selection - Single Line */}
        <div className="flex items-center gap-6 max-w-6xl">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 z-10" />
            <Input
              type="text"
              placeholder="Search for case"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-16 text-2xl border-2 border-border/50 bg-card/50 rounded-none hover-glow focus:shadow-lg backdrop-blur placeholder:text-muted-foreground/30 placeholder:text-xl"
            />
          </div>

          {/* Arrow Separator */}
          <div className="text-4xl font-bold text-primary/40 select-none">
            {'>>>>>>'}
          </div>

          {/* Case Selection */}
          <div className="flex-1">
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger className="h-16 border-2 border-border/50 bg-card/50 rounded-none hover-glow focus:shadow-lg backdrop-blur">
                <SelectValue 
                  placeholder="Choose a case" 
                  className="text-muted-foreground/30 text-2xl"
                />
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
