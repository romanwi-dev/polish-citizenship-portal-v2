import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AIDocumentWorkflow } from "@/components/workflows/AIDocumentWorkflow";
import { ZeroFailVerificationPanel } from "@/components/workflows/ZeroFailVerificationPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ArrowRight, ArrowDown, Shield, Workflow } from "lucide-react";

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
      <div className="space-y-8 p-4 md:p-8">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
          Documents Workflow & Verification
        </h1>

        {/* Tabs for Workflow vs Verification */}
        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              A→B→EX Verification
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Live Workflow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <ZeroFailVerificationPanel />
          </TabsContent>

          <TabsContent value="workflow" className="space-y-8">
            {/* Search and Case Selection - Responsive Layout */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-7xl mx-auto">
              {/* Search Bar */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 z-10" />
                <input
                  type="text"
                  placeholder="Search for case"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-16 md:h-20 w-full pl-12 pr-4 rounded-md border-2 bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work text-2xl placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  style={{
                    boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 50px hsla(221, 83%, 53%, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 60px hsla(221, 83%, 53%, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                />
              </div>

              {/* Arrow Separator - Desktop: Right, Mobile: Down */}
              <div className="flex items-center justify-center">
                <ArrowRight className="hidden md:block h-8 w-8 text-primary/40" />
                <ArrowDown className="md:hidden h-6 w-6 text-primary/40" />
              </div>

              {/* Case Selection */}
              <div className="w-full md:flex-1">
                <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                  <SelectTrigger 
                    className="h-16 md:h-20 rounded-md border-2 bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work text-2xl w-full [&>span]:text-muted-foreground/30"
                    style={{
                      boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.15)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 50px hsla(221, 83%, 53%, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 60px hsla(221, 83%, 53%, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <SelectValue placeholder="Choose a case" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    {filteredCases?.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-lg">
                        {c.client_name || 'Unnamed Case'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Workflow Component */}
            <AIDocumentWorkflow caseId={selectedCaseId} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AIWorkflow;
