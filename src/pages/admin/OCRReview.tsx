import { AdminLayout } from "@/components/AdminLayout";
import { OCRReviewDashboard } from "@/components/OCRReviewDashboard";

const OCRReview = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <OCRReviewDashboard />
      </div>
    </AdminLayout>
  );
};

export default OCRReview;
