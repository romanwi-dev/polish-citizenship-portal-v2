import { ProvenPatternsLibrary } from "@/components/workflows/ProvenPatternsLibrary";

export default function ProvenPatterns() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Proven Patterns Library</h1>
          <p className="text-muted-foreground text-lg">
            A→B→EX Protocol: Learn from successful executions
          </p>
        </div>
        
        <ProvenPatternsLibrary />
      </div>
    </div>
  );
}
