import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MainCTAReference() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/demos')}
            className="mb-2"
          >
            ← Back to Demos
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Main CTA Reference - Golden Standard
          </h1>
          <p className="text-muted-foreground mt-2">
            This is the CORE reference for all main CTAs. All homepage CTAs must match this exactly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Live CTA Demo */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              ✅ CORRECT IMPLEMENTATION
            </h2>
            <p className="text-muted-foreground">
              This is the exact CTA from TestimonialsSection (Line 142-149) - The Golden Reference
            </p>
          </div>

          {/* THE GOLDEN STANDARD CTA */}
          <div className="flex justify-center mt-12 mb-12 animate-fade-in">
            <Button 
              size="lg" 
              className="text-xl md:text-2xl font-bold px-12 py-6 md:px-22 md:py-6 h-auto min-h-[64px] md:min-h-[72px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse"
              onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
              aria-label="Take the Polish Citizenship Test to check your eligibility"
            >
              <span className="relative z-10 font-bold drop-shadow-lg">
                Take Polish Citizenship Test
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>

          <div className="bg-green-500/10 border-2 border-green-500/50 rounded-lg p-6 text-center">
            <p className="text-green-400 font-bold text-lg">
              ✓ Fixed width controlled by padding only
            </p>
            <p className="text-muted-foreground mt-2">
              Mobile: ~304px (px-12) | Desktop: ~528px (md:px-22)
            </p>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="bg-card border border-border rounded-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            📐 Technical Specifications
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Wrapper Structure</h3>
              <div className="bg-muted/50 rounded p-4 font-mono text-sm space-y-1">
                <div className="text-green-400">✓ flex justify-center</div>
                <div className="text-green-400">✓ animate-fade-in</div>
                <div className="text-green-400">✓ mt-40 mb-20 (customizable)</div>
                <div className="text-red-400">✗ NO px-4 or px-6</div>
                <div className="text-red-400">✗ NO padding classes</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Button Size</h3>
              <div className="bg-muted/50 rounded p-4 font-mono text-sm space-y-1">
                <div className="text-green-400">✓ size="lg"</div>
                <div className="text-green-400">✓ px-12 py-6 (mobile)</div>
                <div className="text-green-400">✓ md:px-20 md:py-6 (desktop)</div>
                <div className="text-green-400">✓ text-xl md:text-2xl</div>
                <div className="text-green-400">✓ min-h-[64px] md:min-h-[72px]</div>
                <div className="text-red-400">✗ NO w-full or max-w-*</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Colors & Effects</h3>
              <div className="bg-muted/50 rounded p-4 font-mono text-sm space-y-1">
                <div>bg-red-700</div>
                <div>dark:bg-red-900/60</div>
                <div>hover:bg-red-800</div>
                <div>border-2 border-red-600</div>
                <div>shadow-[0_0_40px_rgba(185,28,28,0.6)]</div>
                <div>backdrop-blur-md</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Animations</h3>
              <div className="bg-muted/50 rounded p-4 font-mono text-sm space-y-1">
                <div className="text-green-400">✓ animate-pulse</div>
                <div className="text-green-400">✓ hover:scale-105</div>
                <div className="text-green-400">✓ transition-all duration-300</div>
                <div className="text-green-400">✓ group hover effects</div>
                <div className="text-green-400">✓ Arrow translate-x-1</div>
              </div>
            </div>
          </div>
        </section>

        {/* Critical Rules */}
        <section className="bg-destructive/10 border-2 border-destructive/50 rounded-lg p-8 space-y-4">
          <h2 className="text-2xl font-bold text-destructive flex items-center gap-2">
            ⚠️ CRITICAL RULES - NEVER VIOLATE
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <X className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground">NEVER add px-4, px-6, or any padding to wrapper div</p>
                <p className="text-sm text-muted-foreground">This narrows the button on mobile and breaks consistency</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <X className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground">NEVER add w-full, max-w-md, or width constraints to Button</p>
                <p className="text-sm text-muted-foreground">Width MUST be controlled by padding only (px-12/md:px-20)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <X className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground">NEVER override padding values</p>
                <p className="text-sm text-muted-foreground">Always use exact: px-12 py-6 md:px-20 md:py-6</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <X className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground">NEVER use different size props</p>
                <p className="text-sm text-muted-foreground">Always use size="lg" - never sm, default, or icon</p>
              </div>
            </div>
          </div>
        </section>

        {/* Viewport Previews */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">📱 Viewport Measurements</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                Mobile (375px)
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-mono text-primary">px-12</span> = 48px total padding (24px each side)</p>
                <p><span className="font-mono text-primary">py-6</span> = 24px vertical padding</p>
                <p><span className="font-mono text-primary">min-h-[64px]</span> = 64px minimum height</p>
                <p className="font-bold text-green-400 mt-4">Expected Width: ~304px</p>
                <p className="text-muted-foreground text-xs">(48px padding × 2 + text content)</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                Desktop (1920px)
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-mono text-primary">md:px-20</span> = 80px total padding (40px each side)</p>
                <p><span className="font-mono text-primary">md:py-6</span> = 24px vertical padding</p>
                <p><span className="font-mono text-primary">md:min-h-[72px]</span> = 72px minimum height</p>
                <p className="font-bold text-green-400 mt-4">Expected Width: ~480px</p>
                <p className="text-muted-foreground text-xs">(80px padding × 2 + text content)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Testing */}
        <section className="bg-card border border-border rounded-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">🧪 Interactive Testing</h2>
          <p className="text-muted-foreground">
            Test the CTA at different viewport sizes to verify consistent width:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm bg-muted px-3 py-1 rounded">375px (Mobile)</span>
              <span className="text-muted-foreground">→ Use browser DevTools responsive mode</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm bg-muted px-3 py-1 rounded">768px (Tablet)</span>
              <span className="text-muted-foreground">→ Should match desktop size (md: breakpoint)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm bg-muted px-3 py-1 rounded">1920px (Desktop)</span>
              <span className="text-muted-foreground">→ Full desktop width (~480px)</span>
            </div>
          </div>
        </section>

        {/* Code Reference */}
        <section className="bg-card border border-border rounded-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">💾 Code Reference</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">✅ CORRECT Implementation</h3>
              <div className="bg-muted/50 rounded p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-foreground">{`<div className="flex justify-center mt-40 mb-20 animate-fade-in">
  <Button 
    size="lg" 
    className="text-xl md:text-2xl font-bold px-12 py-6 md:px-20 md:py-6 h-auto min-h-[64px] md:min-h-[72px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse"
    onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU', '_blank')}
    aria-label="Take the Polish Citizenship Test"
  >
    <span className="relative z-10 flex items-center gap-3 font-bold drop-shadow-lg">
      Take Polish Citizenship Test
      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
    </span>
    <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </Button>
</div>`}</pre>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Source: <span className="font-mono">src/components/TestimonialsSection.tsx</span> (Line 142-149)
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-destructive mb-2">❌ INCORRECT Implementation (DO NOT USE)</h3>
              <div className="bg-destructive/10 rounded p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-foreground">{`<div className="flex justify-center mt-40 mb-20 animate-fade-in px-4">  {/* ❌ px-4 WRONG */}
  <Button 
    size="lg" 
    className="... w-full max-w-md"  {/* ❌ w-full max-w-md WRONG */}
  >
    ...
  </Button>
</div>`}</pre>
              </div>
              <p className="text-sm text-destructive mt-2">
                ⚠️ This was the bug in MainCTA component (FIXED on 2025-01-13)
              </p>
            </div>
          </div>
        </section>

        {/* Documentation Link */}
        <section className="bg-primary/10 border-2 border-primary/50 rounded-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">📚 Full Documentation</h2>
          <p className="text-muted-foreground">
            Complete standards and guidelines available in:
          </p>
          <p className="font-mono text-primary font-bold">
            docs/MAIN_CTA_STANDARDS.md
          </p>
          <p className="text-sm text-muted-foreground">
            Last Updated: 2025-01-11 | Status: LOCKED
          </p>
        </section>

      </div>
    </div>
  );
}
