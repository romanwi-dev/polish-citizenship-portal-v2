import { AdminLayout } from "@/components/AdminLayout";
import { AIAgentPanel } from "@/components/AIAgentPanel";
import { useParams } from "react-router-dom";

const Writer = () => {
  const { id } = useParams();
  const caseId = id || "";

  return (
    <AdminLayout>
      <AIAgentPanel caseId={caseId} />
    </AdminLayout>
  );
};

export default Writer;
