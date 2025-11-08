import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { POAThreeClickWizard } from "@/components/poa/POAThreeClickWizard";

export default function POAOCRPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p>Case ID not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/cases/${id}?tab=forms&section=poa`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Case
          </Button>
          <h1 className="text-4xl font-heading font-black mb-2">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              POA OCR Wizard
            </span>
          </h1>
          <p className="text-muted-foreground">
            Scan documents with OCR to auto-populate POA form
          </p>
        </div>

        <POAThreeClickWizard caseId={id} useBatchMode={false} />
      </div>
    </AdminLayout>
  );
}
