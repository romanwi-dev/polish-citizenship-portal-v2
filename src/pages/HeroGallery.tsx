import { useState } from 'react';
import { Hero3DCrystalForm } from '@/components/heroes/demos/Hero3DCrystalForm';
import { HeroVideoForm } from '@/components/heroes/demos/HeroVideoForm';
import { HeroGradientForm } from '@/components/heroes/demos/HeroGradientForm';
import { HeroParticlesForm } from '@/components/heroes/demos/HeroParticlesForm';
import { HeroGlassMorphForm } from '@/components/heroes/demos/HeroGlassMorphForm';
import { Hero3DGeometric } from '@/components/heroes/demos/Hero3DGeometric';
import { HeroWaveBackground } from '@/components/heroes/demos/HeroWaveBackground';
import { HeroHolographic } from '@/components/heroes/demos/HeroHolographic';
import { HeroCinematicVideo } from '@/components/heroes/demos/HeroCinematicVideo';
import { HeroNorthernLights } from '@/components/heroes/demos/HeroNorthernLights';
import { Button } from '@/components/ui/button';

const heroes = [
  { id: '3d-crystal-form', name: '3D Crystal with Form', component: Hero3DCrystalForm, hasForm: true },
  { id: 'video-form', name: 'Video Background with Form', component: HeroVideoForm, hasForm: true },
  { id: 'gradient-form', name: 'Animated Gradient with Form', component: HeroGradientForm, hasForm: true },
  { id: 'particles-form', name: 'Particle System with Form', component: HeroParticlesForm, hasForm: true },
  { id: 'glass-form', name: 'Glassmorphism with Form', component: HeroGlassMorphForm, hasForm: true },
  { id: '3d-geometric', name: '3D Geometric Shapes', component: Hero3DGeometric, hasForm: false },
  { id: 'wave', name: 'Animated Wave Background', component: HeroWaveBackground, hasForm: false },
  { id: 'holographic', name: 'Holographic Effect', component: HeroHolographic, hasForm: false },
  { id: 'cinematic', name: 'Cinematic Video Parallax', component: HeroCinematicVideo, hasForm: false },
  { id: 'northern-lights', name: 'Northern Lights Aurora', component: HeroNorthernLights, hasForm: false },
];

const HeroGallery = () => {
  const [selectedHero, setSelectedHero] = useState(0);
  const SelectedComponent = heroes[selectedHero].component;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hero Sections Gallery
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHero((prev) => (prev - 1 + heroes.length) % heroes.length)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHero((prev) => (prev + 1) % heroes.length)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Selector */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {heroes.map((hero, index) => (
              <button
                key={hero.id}
                onClick={() => setSelectedHero(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedHero === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/10 hover:bg-secondary/20'
                }`}
              >
                <div className="text-sm font-medium">{hero.name}</div>
                <div className="text-xs opacity-70">
                  {hero.hasForm ? 'With Form' : 'No Form'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Display */}
      <div className="pt-32">
        <SelectedComponent />
      </div>

      {/* Info Panel */}
      <div className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-xl border border-border rounded-lg p-4 max-w-xs">
        <h3 className="font-bold text-sm mb-2">Currently Viewing:</h3>
        <p className="text-sm text-foreground/70 mb-1">{heroes[selectedHero].name}</p>
        <p className="text-xs text-foreground/50">
          {selectedHero + 1} of {heroes.length}
        </p>
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-foreground/70">
            {heroes[selectedHero].hasForm ? '✓ Includes lead capture form' : '○ No form included'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroGallery;