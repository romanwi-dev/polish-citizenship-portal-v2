import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function PulsingRing({ position, color, delay }: { position: [number, number, number], color: string, delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2 + delay) * 0.2;
      meshRef.current.scale.set(scale, scale, 1);
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1.5, 0.1, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

export const HeroPulsingRings = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const isRTL = i18n.language === 'he';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <PulsingRing position={[0, 0, 0]} color="#dc2626" delay={0} />
          <PulsingRing position={[0, 0, -0.5]} color="#ffffff" delay={1} />
          <PulsingRing position={[0, 0, -1]} color="#003399" delay={2} />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/90 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-heading font-black">
              <span className={`bg-clip-text text-transparent ${isRTL ? 'bg-gradient-to-r from-accent via-secondary to-primary' : 'bg-gradient-to-r from-primary via-secondary to-accent'}`}>
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl text-foreground/80">
              {t('hero.description')}
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-primary/20 backdrop-blur-xl">
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
