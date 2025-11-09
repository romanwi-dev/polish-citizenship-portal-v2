import { MobileFirstGuardian as GuardianComponent } from "@/components/guardian/MobileFirstGuardian";

export default function MobileFirstGuardian() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <GuardianComponent />
      </div>
    </div>
  );
}
