import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNavigationDesign, type NavigationDesign } from '@/hooks/useNavigationDesign';

const DESIGNS: Array<{ id: NavigationDesign; name: string; description: string }> = [
  { id: 'glassmorphic', name: 'Glassmorphic Aurora', description: 'Frosted glass with animated aurora gradients' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', description: 'Dark background with neon green accents' },
  { id: 'minimal', name: 'Minimal Zen', description: 'Clean and minimalist with subtle animations' },
  { id: 'neumorphic', name: 'Neumorphic Soft', description: 'Soft shadows with tactile feedback' },
  { id: 'material', name: 'Material You 3D', description: 'Google Material Design with elevated cards' },
  { id: 'brutalist', name: 'Brutalist Bold', description: 'High contrast with raw grid layout' },
  { id: 'gradient', name: 'Gradient Mesh Flow', description: 'Animated mesh gradients with organic shapes' },
  { id: 'retro', name: 'Retro Terminal', description: 'Green monochrome CRT terminal aesthetic' },
  { id: 'luxury', name: 'Luxury Gold Foil', description: 'Dark navy with gold metallic accents' },
  { id: 'particle', name: 'Animated Particle Field', description: 'Interactive particles with sci-fi feel' },
];

export const DesignSelector = () => {
  const { design, changeDesign } = useNavigationDesign();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Palette className="h-4 w-4" />
          Design
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Navigation Design</DialogTitle>
          <DialogDescription>
            Select from 10 stunning design variations for your mobile navigation
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {DESIGNS.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                changeDesign(d.id);
                setOpen(false);
              }}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-105 ${
                design === d.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold mb-1">{d.name}</div>
              <div className="text-sm text-muted-foreground">{d.description}</div>
              {design === d.id && (
                <div className="mt-2 text-xs font-medium text-primary">✓ Active</div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
