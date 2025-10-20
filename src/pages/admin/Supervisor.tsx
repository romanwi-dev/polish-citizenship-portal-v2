import { AdminLayout } from "@/components/AdminLayout";
import { AIAgentPanel } from "@/components/AIAgentPanel";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Supervisor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const caseId = id || "";

  useEffect(() => {
    if (!id) {
      toast({
        title: "Navigation Error",
        description: "Please access Supervisor from a case detail page",
        variant: "destructive",
      });
      navigate("/admin/cases");
    }
  }, [id, navigate, toast]);

  if (!caseId) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <ShieldCheck className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Case Selected</h2>
          <p className="text-muted-foreground">Please select a case to use the Supervisor agent</p>
          <Button onClick={() => navigate("/admin/cases")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const supervisorPrompts = [
    "Review all agent outputs for this case and identify any errors or inconsistencies",
    "Check if all required documents are properly processed and translated",
    "Verify the family tree data matches the intake form information",
    "Audit the POA generation and OBY form completion for accuracy",
    "Cross-check dates and names across all forms for consistency",
    "Identify missing or incomplete data that other agents may have missed",
    "Review document translations for quality and completeness",
    "Validate all research findings and archive search results",
    "Check if all tasks are properly assigned and tracked",
    "Generate a comprehensive error report for this case"
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <Alert className="border-primary/20 bg-primary/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Supervisor Agent - Quality Control & Error Detection</AlertTitle>
          <AlertDescription>
            This agent oversees all other agents, reviews their outputs, detects errors, and ensures data consistency across the entire case.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Supervisor Agent</h1>
            <p className="text-muted-foreground">Quality control, error detection, and agent coordination</p>
          </div>
        </div>

        <AIAgentPanel 
          caseId={caseId} 
          defaultAction="supervisor" 
          showActionSelector={false}
          customQuickPrompts={supervisorPrompts}
        />
      </div>
    </AdminLayout>
  );
};

export default Supervisor;
