import { AdminLayout } from "@/components/AdminLayout";
import { AIAgentPanel } from "@/components/AIAgentPanel";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Palette } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Designer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const caseId = id || "";

  useEffect(() => {
    if (!id) {
      toast({
        title: "Navigation Error",
        description: "Please access Designer from a case detail page",
        variant: "destructive",
      });
      navigate("/admin/cases");
    }
  }, [id, navigate, toast]);

  if (!caseId) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Palette className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Case Selected</h2>
          <p className="text-muted-foreground">Please select a case to use the Designer agent</p>
          <Button onClick={() => navigate("/admin/cases")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const designerPrompts = [
    "Suggest UI improvements for the case detail page",
    "How can we improve the document upload flow?",
    "Recommend a better layout for the forms",
    "Analyze accessibility issues in the client portal",
    "Suggest color scheme improvements for better readability",
    "How can we make the timeline visualization more intuitive?"
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Designer Agent</h1>
            <p className="text-muted-foreground">UI/UX design optimization and recommendations</p>
          </div>
        </div>
        <AIAgentPanel 
          caseId={caseId} 
          defaultAction="designer" 
          showActionSelector={false}
          customQuickPrompts={designerPrompts}
        />
      </div>
    </AdminLayout>
  );
};

export default Designer;
