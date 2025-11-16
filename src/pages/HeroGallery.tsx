import { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';

// Lazy load all hero components for better performance
const Hero3DFlagWave = lazy(() => import('@/components/heroes/premium/Hero3DFlagWave').then(m => ({ default: m.Hero3DFlagWave })));
const Hero3DCrystalFlags = lazy(() => import('@/components/heroes/premium/Hero3DCrystalFlags').then(m => ({ default: m.Hero3DCrystalFlags })));
const HeroHolographicFlags = lazy(() => import('@/components/heroes/premium/HeroHolographicFlags').then(m => ({ default: m.HeroHolographicFlags })));
const HeroParticleUniverse = lazy(() => import('@/components/heroes/premium/HeroParticleUniverse').then(m => ({ default: m.HeroParticleUniverse })));
const Hero3DGlowingOrbs = lazy(() => import('@/components/heroes/premium/Hero3DGlowingOrbs').then(m => ({ default: m.Hero3DGlowingOrbs })));
const Hero3DRotatingCubes = lazy(() => import('@/components/heroes/premium/Hero3DRotatingCubes').then(m => ({ default: m.Hero3DRotatingCubes })));
const HeroSpinningTorus = lazy(() => import('@/components/heroes/premium/HeroSpinningTorus').then(m => ({ default: m.HeroSpinningTorus })));
const HeroGeometricSpheres = lazy(() => import('@/components/heroes/premium/HeroGeometricSpheres').then(m => ({ default: m.HeroGeometricSpheres })));
const HeroPulsingRings = lazy(() => import('@/components/heroes/premium/HeroPulsingRings').then(m => ({ default: m.HeroPulsingRings })));
const HeroFloatingPyramids = lazy(() => import('@/components/heroes/premium/HeroFloatingPyramids').then(m => ({ default: m.HeroFloatingPyramids })));
const HeroGlassOctahedrons = lazy(() => import('@/components/heroes/premium/HeroGlassOctahedrons').then(m => ({ default: m.HeroGlassOctahedrons })));
const HeroStarField = lazy(() => import('@/components/heroes/premium/HeroStarField').then(m => ({ default: m.HeroStarField })));
const HeroEUStarRing = lazy(() => import('@/components/heroes/premium/HeroEUStarRing').then(m => ({ default: m.HeroEUStarRing })));
const HeroNeonGrid = lazy(() => import('@/components/heroes/premium/HeroNeonGrid').then(m => ({ default: m.HeroNeonGrid })));
const HeroMetallicSpheres = lazy(() => import('@/components/heroes/premium/HeroMetallicSpheres').then(m => ({ default: m.HeroMetallicSpheres })));
const HeroDNAHelix = lazy(() => import('@/components/heroes/premium/HeroDNAHelix').then(m => ({ default: m.HeroDNAHelix })));
const HeroCylinderField = lazy(() => import('@/components/heroes/premium/HeroCylinderField').then(m => ({ default: m.HeroCylinderField })));
const HeroLightBeams = lazy(() => import('@/components/heroes/premium/HeroLightBeams').then(m => ({ default: m.HeroLightBeams })));
const HeroSpiralingCubes = lazy(() => import('@/components/heroes/premium/HeroSpiralingCubes').then(m => ({ default: m.HeroSpiralingCubes })));
const HeroFloatingDiamonds = lazy(() => import('@/components/heroes/premium/HeroFloatingDiamonds').then(m => ({ default: m.HeroFloatingDiamonds })));
const HeroVortexParticles = lazy(() => import('@/components/heroes/premium/HeroVortexParticles').then(m => ({ default: m.HeroVortexParticles })));
const HeroWavingFlags = lazy(() => import('@/components/heroes/premium/HeroWavingFlags').then(m => ({ default: m.HeroWavingFlags })));
const HeroFloatingFlags3D = lazy(() => import('@/components/heroes/premium/HeroFloatingFlags3D').then(m => ({ default: m.HeroFloatingFlags3D })));
const HeroRippleFlags = lazy(() => import('@/components/heroes/premium/HeroRippleFlags').then(m => ({ default: m.HeroRippleFlags })));
const HeroSpinningFlagCircle = lazy(() => import('@/components/heroes/premium/HeroSpinningFlagCircle').then(m => ({ default: m.HeroSpinningFlagCircle })));
const HeroPulsingFlagSphere = lazy(() => import('@/components/heroes/premium/HeroPulsingFlagSphere').then(m => ({ default: m.HeroPulsingFlagSphere })));
const HeroHelixFlags = lazy(() => import('@/components/heroes/premium/HeroHelixFlags').then(m => ({ default: m.HeroHelixFlags })));
const HeroOrbitalFlags = lazy(() => import('@/components/heroes/premium/HeroOrbitalFlags').then(m => ({ default: m.HeroOrbitalFlags })));
const HeroFlagWaveField = lazy(() => import('@/components/heroes/premium/HeroFlagWaveField').then(m => ({ default: m.HeroFlagWaveField })));
const HeroTwistingFlags = lazy(() => import('@/components/heroes/premium/HeroTwistingFlags').then(m => ({ default: m.HeroTwistingFlags })));
const HeroFlagConstellation = lazy(() => import('@/components/heroes/premium/HeroFlagConstellation').then(m => ({ default: m.HeroFlagConstellation })));
const Hero3DCrystalForm = lazy(() => import('@/components/heroes/demos/Hero3DCrystalForm').then(m => ({ default: m.Hero3DCrystalForm })));
const HeroVideoForm = lazy(() => import('@/components/heroes/demos/HeroVideoForm').then(m => ({ default: m.HeroVideoForm })));
const HeroGradientForm = lazy(() => import('@/components/heroes/demos/HeroGradientForm').then(m => ({ default: m.HeroGradientForm })));
const HeroParticlesForm = lazy(() => import('@/components/heroes/demos/HeroParticlesForm').then(m => ({ default: m.HeroParticlesForm })));
const HeroGlassMorphForm = lazy(() => import('@/components/heroes/demos/HeroGlassMorphForm').then(m => ({ default: m.HeroGlassMorphForm })));
const Hero3DGeometric = lazy(() => import('@/components/heroes/demos/Hero3DGeometric').then(m => ({ default: m.Hero3DGeometric })));
const HeroWaveBackground = lazy(() => import('@/components/heroes/demos/HeroWaveBackground').then(m => ({ default: m.HeroWaveBackground })));
const HeroHolographic = lazy(() => import('@/components/heroes/demos/HeroHolographic').then(m => ({ default: m.HeroHolographic })));
const HeroCinematicVideo = lazy(() => import('@/components/heroes/demos/HeroCinematicVideo').then(m => ({ default: m.HeroCinematicVideo })));
const HeroNorthernLights = lazy(() => import('@/components/heroes/demos/HeroNorthernLights').then(m => ({ default: m.HeroNorthernLights })));

const heroes = [
  { id: 'waving-flags', name: 'Waving Flags', component: HeroWavingFlags, hasForm: true },
  { id: 'floating-flags-3d', name: 'Floating Flags 3D', component: HeroFloatingFlags3D, hasForm: true },
  { id: 'ripple-flags', name: 'Ripple Flags', component: HeroRippleFlags, hasForm: true },
  { id: 'spinning-flag-circle', name: 'Spinning Flag Circle', component: HeroSpinningFlagCircle, hasForm: true },
  { id: 'pulsing-flag-sphere', name: 'Pulsing Flag Sphere', component: HeroPulsingFlagSphere, hasForm: true },
  { id: 'helix-flags', name: 'Helix Flags', component: HeroHelixFlags, hasForm: true },
  { id: 'orbital-flags', name: 'Orbital Flags', component: HeroOrbitalFlags, hasForm: true },
  { id: 'flag-wave-field', name: 'Flag Wave Field', component: HeroFlagWaveField, hasForm: true },
  { id: 'twisting-flags', name: 'Twisting Flags', component: HeroTwistingFlags, hasForm: true },
  { id: 'flag-constellation', name: 'Flag Constellation', component: HeroFlagConstellation, hasForm: true },
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
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-lg text-foreground/70">Loading hero section...</p>
            </div>
          </div>
        }>
          <SelectedComponent />
        </Suspense>
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