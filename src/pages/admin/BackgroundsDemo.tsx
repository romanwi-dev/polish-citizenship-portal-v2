import { lazy, Suspense, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const ClassicWaving = lazy(() => import("@/components/backgrounds/ClassicWaving").then(m => ({ default: m.ClassicWaving })));
const GentleFloat = lazy(() => import("@/components/backgrounds/GentleFloat").then(m => ({ default: m.GentleFloat })));
const RippleEffect = lazy(() => import("@/components/backgrounds/RippleEffect").then(m => ({ default: m.RippleEffect })));
const PulseGlow = lazy(() => import("@/components/backgrounds/PulseGlow").then(m => ({ default: m.PulseGlow })));
const SpiralMotion = lazy(() => import("@/components/backgrounds/SpiralMotion").then(m => ({ default: m.SpiralMotion })));
const WaveCascade = lazy(() => import("@/components/backgrounds/WaveCascade").then(m => ({ default: m.WaveCascade })));
const ShimmerEffect = lazy(() => import("@/components/backgrounds/ShimmerEffect").then(m => ({ default: m.ShimmerEffect })));
const DeepSpace = lazy(() => import("@/components/backgrounds/DeepSpace").then(m => ({ default: m.DeepSpace })));
const NorthernLights = lazy(() => import("@/components/backgrounds/NorthernLights").then(m => ({ default: m.NorthernLights })));
const CrystalClear = lazy(() => import("@/components/backgrounds/CrystalClear").then(m => ({ default: m.CrystalClear })));

const backgrounds = [
  {
    id: "classic",
    name: "Classic Waving",
    component: ClassicWaving,
    description: "Traditional EU flag with smooth waving motion",
    specs: "Opacity: 15% • Blur: 2px • Speed: 0.3x"
  },
  {
    id: "gentle",
    name: "Gentle Float",
    component: GentleFloat,
    description: "Soft floating with gradient background",
    specs: "Opacity: 20% • Blur: 4px • Speed: 0.15x"
  },
  {
    id: "ripple",
    name: "Ripple Effect",
    component: RippleEffect,
    description: "Concentric ripples emanating from center",
    specs: "Opacity: 12% • Blur: 2px • Speed: 0.4x"
  },
  {
    id: "pulse",
    name: "Pulse Glow",
    component: PulseGlow,
    description: "Pulsating glow with dynamic opacity",
    specs: "Opacity: 25% • Blur: 1px • Speed: 0.25x"
  },
  {
    id: "spiral",
    name: "Spiral Motion",
    component: SpiralMotion,
    description: "Hypnotic spiral wave pattern",
    specs: "Opacity: 18% • Blur: 3px • Speed: 0.5x"
  },
  {
    id: "cascade",
    name: "Wave Cascade",
    component: WaveCascade,
    description: "Multiple overlapping wave patterns",
    specs: "Opacity: 16% • Blur: 2px • Speed: 0.35x"
  },
  {
    id: "shimmer",
    name: "Shimmer Effect",
    component: ShimmerEffect,
    description: "Metallic shimmer with dynamic reflections",
    specs: "Opacity: 22% • Blur: 1px • Speed: 0.28x"
  },
  {
    id: "deepspace",
    name: "Deep Space",
    component: DeepSpace,
    description: "Dark cosmic theme with glowing stars",
    specs: "Opacity: 30% • Blur: 4px • Speed: 0.18x"
  },
  {
    id: "aurora",
    name: "Northern Lights",
    component: NorthernLights,
    description: "Aurora borealis-inspired flowing waves",
    specs: "Opacity: 20% • Blur: 4px • Speed: 0.22x"
  },
  {
    id: "crystal",
    name: "Crystal Clear",
    component: CrystalClear,
    description: "Clean, subtle, professional motion",
    specs: "Opacity: 25% • Blur: 0.5px • Speed: 0.12x"
  }
];

const BackgroundsDemo = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            3D EU Flag Backgrounds
          </h1>
          <p className="text-muted-foreground text-lg">
            10 stunning variations with different animations, colors, and effects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {backgrounds.map((bg) => (
            <Card key={bg.id} className="overflow-hidden group relative">
              <div className="relative h-80 bg-gradient-to-br from-background to-muted">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                  </div>
                }>
                  <bg.component />
                </Suspense>
                
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                
                {selected === bg.id && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-lg">{bg.name}</h3>
                    <p className="text-sm text-muted-foreground">{bg.description}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    #{backgrounds.indexOf(bg) + 1}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground font-mono">
                  {bg.specs}
                </p>
                
                <Button 
                  onClick={() => setSelected(bg.id)}
                  variant={selected === bg.id ? "default" : "outline"}
                  className="w-full"
                >
                  {selected === bg.id ? "Selected" : "Select This Design"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {selected && (
          <Card className="p-6 text-center bg-primary/5 border-primary/20">
            <p className="text-lg font-medium">
              Selected: <span className="text-primary font-bold">
                {backgrounds.find(bg => bg.id === selected)?.name}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You can now implement this design in your hero section
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BackgroundsDemo;
