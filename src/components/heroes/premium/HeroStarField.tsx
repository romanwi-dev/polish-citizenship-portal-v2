import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function StarField() {
  const ref = useRef<THREE.Points>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const particleCount = 10000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    
    const colorChoice = Math.random();
    if (colorChoice < 0.33) {
      colors[i * 3] = 0.86; colors[i * 3 + 1] = 0.15; colors[i * 3 + 2] = 0.15;
    } else if (colorChoice < 0.66) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
    } else {
      colors[i * 3] = 0; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.6;
    }
  }

  useFrame((state) => {
    if (ref.current && !prefersReducedMotion) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export const HeroStarField = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <StarField />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/60 to-background/85 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-heading font-black">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl text-foreground/80">
              {t('hero.description')}
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-border/50 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:border-primary outline-none"
                  required
                />
              </div>
              <MainCTA ariaLabel="Start your Polish citizenship journey" wrapperClassName="">Get Started</MainCTA>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
