import { CodeReviewDashboard } from "@/components/workflows/CodeReviewDashboard";
import { AdminLayout } from "@/components/AdminLayout";

const CodeReview = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <CodeReviewDashboard />
      </div>
    </AdminLayout>
  );
};

export default CodeReview;
