import { AdminLayout } from "@/components/AdminLayout";
import { AIAgentPanel } from "@/components/AIAgentPanel";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenTool } from "lucide-react";

const Writer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseId = id || "";

  if (!caseId) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <PenTool className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Case Selected</h2>
          <p className="text-muted-foreground">Please select a case to use the Writer agent</p>
          <Button onClick={() => navigate("/admin/cases")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <PenTool className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Writer Agent</h1>
            <p className="text-muted-foreground">Create professional content and communications</p>
          </div>
        </div>
        <AIAgentPanel caseId={caseId} defaultAction="writer" showActionSelector={false} />
      </div>
    </AdminLayout>
  );
};

export default Writer;
