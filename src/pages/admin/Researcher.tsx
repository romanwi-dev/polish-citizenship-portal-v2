import { AdminLayout } from "@/components/AdminLayout";
import { AIAgentPanel } from "@/components/AIAgentPanel";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

const Researcher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseId = id || "";

  if (!caseId) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Search className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Case Selected</h2>
          <p className="text-muted-foreground">Please select a case to use the Researcher agent</p>
          <Button onClick={() => navigate("/admin/cases")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const researcherPrompts = [
    "Research the citizenship laws that apply to this case",
    "Find historical context for documents from this time period",
    "What archives should we contact for this ancestry line?",
    "Research legal precedents for similar cases",
    "Analyze document availability in this region",
    "What are the key historical events affecting this case?"
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Search className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Researcher Agent</h1>
            <p className="text-muted-foreground">In-depth research and analysis with citations</p>
          </div>
        </div>
        <AIAgentPanel 
          caseId={caseId} 
          defaultAction="researcher" 
          showActionSelector={false}
          customQuickPrompts={researcherPrompts}
        />
      </div>
    </AdminLayout>
  );
};

export default Researcher;
