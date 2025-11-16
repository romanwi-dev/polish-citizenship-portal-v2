import { useState } from 'react';
import { Hero3DFlagWave } from '@/components/heroes/premium/Hero3DFlagWave';
import { Hero3DCrystalFlags } from '@/components/heroes/premium/Hero3DCrystalFlags';
import { HeroHolographicFlags } from '@/components/heroes/premium/HeroHolographicFlags';
import { HeroParticleUniverse } from '@/components/heroes/premium/HeroParticleUniverse';
import { Hero3DGlowingOrbs } from '@/components/heroes/premium/Hero3DGlowingOrbs';
import { Hero3DRotatingCubes } from '@/components/heroes/premium/Hero3DRotatingCubes';
import { HeroSpinningTorus } from '@/components/heroes/premium/HeroSpinningTorus';
import { HeroGeometricSpheres } from '@/components/heroes/premium/HeroGeometricSpheres';
import { HeroPulsingRings } from '@/components/heroes/premium/HeroPulsingRings';
import { HeroFloatingPyramids } from '@/components/heroes/premium/HeroFloatingPyramids';
import { HeroGlassOctahedrons } from '@/components/heroes/premium/HeroGlassOctahedrons';
import { HeroStarField } from '@/components/heroes/premium/HeroStarField';
import { HeroEUStarRing } from '@/components/heroes/premium/HeroEUStarRing';
import { HeroNeonGrid } from '@/components/heroes/premium/HeroNeonGrid';
import { HeroMetallicSpheres } from '@/components/heroes/premium/HeroMetallicSpheres';
import { HeroDNAHelix } from '@/components/heroes/premium/HeroDNAHelix';
import { HeroCylinderField } from '@/components/heroes/premium/HeroCylinderField';
import { HeroLightBeams } from '@/components/heroes/premium/HeroLightBeams';
import { HeroSpiralingCubes } from '@/components/heroes/premium/HeroSpiralingCubes';
import { HeroFloatingDiamonds } from '@/components/heroes/premium/HeroFloatingDiamonds';
import { HeroVortexParticles } from '@/components/heroes/premium/HeroVortexParticles';
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
  { id: 'flag-wave', name: '3D Waving Flags', component: Hero3DFlagWave, hasForm: true },
  { id: 'crystal-flags', name: 'Crystal Flags', component: Hero3DCrystalFlags, hasForm: true },
  { id: 'holographic-flags', name: 'Holographic Flags', component: HeroHolographicFlags, hasForm: true },
  { id: 'particle-universe', name: 'Particle Universe', component: HeroParticleUniverse, hasForm: true },
  { id: 'glowing-orbs', name: 'Glowing Orbs', component: Hero3DGlowingOrbs, hasForm: true },
  { id: 'rotating-cubes', name: 'Rotating Cubes', component: Hero3DRotatingCubes, hasForm: true },
  { id: 'spinning-torus', name: 'Spinning Torus', component: HeroSpinningTorus, hasForm: true },
  { id: 'geometric-spheres', name: 'Geometric Spheres', component: HeroGeometricSpheres, hasForm: true },
  { id: 'pulsing-rings', name: 'Pulsing Rings', component: HeroPulsingRings, hasForm: true },
  { id: 'floating-pyramids', name: 'Floating Pyramids', component: HeroFloatingPyramids, hasForm: true },
  { id: 'glass-octahedrons', name: 'Glass Octahedrons', component: HeroGlassOctahedrons, hasForm: true },
  { id: 'star-field', name: 'Star Field', component: HeroStarField, hasForm: true },
  { id: 'eu-star-ring', name: 'EU Star Ring', component: HeroEUStarRing, hasForm: true },
  { id: 'neon-grid', name: 'Neon Grid', component: HeroNeonGrid, hasForm: true },
  { id: 'metallic-spheres', name: 'Metallic Spheres', component: HeroMetallicSpheres, hasForm: true },
  { id: 'dna-helix', name: 'DNA Helix', component: HeroDNAHelix, hasForm: true },
  { id: 'cylinder-field', name: 'Cylinder Field', component: HeroCylinderField, hasForm: true },
  { id: 'light-beams', name: 'Light Beams', component: HeroLightBeams, hasForm: true },
  { id: 'spiraling-cubes', name: 'Spiraling Cubes', component: HeroSpiralingCubes, hasForm: true },
  { id: 'floating-diamonds', name: 'Floating Diamonds', component: HeroFloatingDiamonds, hasForm: true },
  { id: 'vortex-particles', name: 'Vortex Particles', component: HeroVortexParticles, hasForm: true },
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