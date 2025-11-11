import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Palette, Type, Layout, Zap } from "lucide-react";

const DesignShowcase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Button variant="ghost" onClick={() => navigate('/demos')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Demos
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Design System Showcase
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Complete Design System</span>
            </div>
            <h2 className="text-5xl font-heading font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                UI Components & Design
              </span>
            </h2>
          </div>

          {/* Typography Section */}
          <div className="glass-card p-8 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Type className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Typography</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-heading font-black mb-2">Heading 1</h1>
                <p className="text-muted-foreground text-sm">font-heading font-black text-5xl</p>
              </div>
              <div>
                <h2 className="text-4xl font-heading font-bold mb-2">Heading 2</h2>
                <p className="text-muted-foreground text-sm">font-heading font-bold text-4xl</p>
              </div>
              <div>
                <h3 className="text-3xl font-semibold mb-2">Heading 3</h3>
                <p className="text-muted-foreground text-sm">font-semibold text-3xl</p>
              </div>
              <div>
                <p className="text-lg mb-2">Body Large - The quick brown fox jumps over the lazy dog</p>
                <p className="text-muted-foreground text-sm">text-lg</p>
              </div>
              <div>
                <p className="mb-2">Body Regular - The quick brown fox jumps over the lazy dog</p>
                <p className="text-muted-foreground text-sm">text-base</p>
              </div>
              <div>
                <p className="text-sm mb-2">Body Small - The quick brown fox jumps over the lazy dog</p>
                <p className="text-muted-foreground text-sm">text-sm</p>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="glass-card p-8 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Color Palette</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-24 bg-primary rounded-lg border border-border"></div>
                <p className="text-sm font-medium">Primary</p>
                <p className="text-xs text-muted-foreground">Main brand color</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-secondary rounded-lg border border-border"></div>
                <p className="text-sm font-medium">Secondary</p>
                <p className="text-xs text-muted-foreground">Supporting color</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-accent rounded-lg border border-border"></div>
                <p className="text-sm font-medium">Accent</p>
                <p className="text-xs text-muted-foreground">Highlight color</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-muted rounded-lg border border-border"></div>
                <p className="text-sm font-medium">Muted</p>
                <p className="text-xs text-muted-foreground">Background shade</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="glass-card p-8 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Buttons</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button className="hover-glow">With Glow</Button>
                <Button className="bg-gradient-to-r from-primary to-secondary">Gradient</Button>
              </div>
            </div>
          </div>

          {/* Cards & Layouts */}
          <div className="glass-card p-8 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Layout className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Cards & Layouts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-lg">
                <Sparkles className="h-8 w-8 text-primary mb-4" />
                <h4 className="text-lg font-bold mb-2">Glass Card</h4>
                <p className="text-sm text-muted-foreground">Translucent card with backdrop blur</p>
              </div>
              <div className="glass-card p-6 rounded-lg hover-glow">
                <Sparkles className="h-8 w-8 text-secondary mb-4" />
                <h4 className="text-lg font-bold mb-2">Hover Glow</h4>
                <p className="text-sm text-muted-foreground">Card with glow effect on hover</p>
              </div>
              <div className="glass-card p-6 rounded-lg border-2 border-primary/20">
                <Sparkles className="h-8 w-8 text-accent mb-4" />
                <h4 className="text-lg font-bold mb-2">With Border</h4>
                <p className="text-sm text-muted-foreground">Enhanced border styling</p>
              </div>
            </div>
          </div>

          {/* Gradients */}
          <div className="glass-card p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Gradient Text</h3>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Primary to Secondary Gradient
              </h2>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Three Color Gradient
              </h2>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Accent to Primary Gradient
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignShowcase;
