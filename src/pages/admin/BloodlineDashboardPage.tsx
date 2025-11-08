import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowLeft, TreePine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BloodlineDashboard } from "@/components/bloodline/BloodlineDashboard";
import { toast } from "sonner";

export default function BloodlineDashboardPage() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMasterData = async () => {
      if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('master_table')
          .select('*')
          .eq('case_id', caseId)
          .maybeSingle();

        if (error) throw error;
        
        setMasterData(data);
      } catch (error: any) {
        console.error('Error loading master data:', error);
        toast.error('Failed to load bloodline data');
      } finally {
        setIsLoading(false);
      }
    };

    loadMasterData();
  }, [caseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <TreePine className="h-16 w-16 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-12 px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Polish Bloodline Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete ancestry path visualization with generation tracking
            </p>
          </div>
          <Button
            onClick={() => navigate(`/admin/master-data/${caseId}`)}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Master Data
          </Button>
        </div>

        {/* Bloodline Dashboard */}
        <BloodlineDashboard masterData={masterData} />
      </div>
    </div>
  );
}
