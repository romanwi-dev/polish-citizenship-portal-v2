import { VerificationCommandB } from "@/components/VerificationCommandB";

export default function VerificationB() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Command B</h1>
          <p className="text-muted-foreground text-lg">
            A→B→EX Protocol: Phase B Triple-Model Verification
          </p>
        </div>
        
        <VerificationCommandB />
      </div>
    </div>
  );
}
