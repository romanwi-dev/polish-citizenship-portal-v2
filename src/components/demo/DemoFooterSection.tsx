import { lazy, Suspense } from "react";
import FooterWeb3 from "@/components/FooterWeb3";

const LandmarkUnity = lazy(() => import("@/components/heroes/LandmarkUnity").then(m => ({ default: m.LandmarkUnity })));

const DemoFooterSection = () => {
  return (
    <div className="relative">
      {/* Background Image Layer */}
      <Suspense fallback={
        <div className="w-full h-[400px] bg-gradient-to-b from-background/50 to-background" />
      }>
        <div className="absolute inset-0 z-0">
          <LandmarkUnity />
        </div>
      </Suspense>
      
      {/* Footer Content */}
      <div className="relative z-10">
        <FooterWeb3 />
      </div>
    </div>
  );
};

export default DemoFooterSection;
