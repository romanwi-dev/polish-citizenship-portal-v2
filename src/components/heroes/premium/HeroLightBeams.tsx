import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function LightBeams() {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (groupRef.current && !prefersReducedMotion) {
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
    }
  });

  const beams = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    beams.push(
      <mesh key={i} rotation={[0, 0, angle]}>
        <boxGeometry args={[0.1, 10, 0.1]} />
        <meshBasicMaterial
          color={i % 3 === 0 ? '#dc2626' : i % 3 === 1 ? '#ffffff' : '#003399'}
          transparent
          opacity={0.3}
        />
      </mesh>
    );
  }

  return <group ref={groupRef}>{beams}</group>;
}

export const HeroLightBeams = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', country: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <LightBeams />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/90 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80">
              {t('hero.description')}
            </p>
            
            {/* 3 Feature Cards */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-xs text-foreground/70">Years</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="text-2xl font-bold text-secondary">5000+</div>
                <div className="text-xs text-foreground/70">Cases</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">Top</div>
                <div className="text-xs text-foreground/70">Rated</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-primary/20 backdrop-blur-xl shadow-lg">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Start Your Journey
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground/80">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:border-primary outline-none transition-colors text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:border-primary outline-none transition-colors text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium text-foreground/80">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:border-primary outline-none transition-colors text-foreground"
                  required
                />
              </div>
              <MainCTA ariaLabel="Start your Polish citizenship journey" wrapperClassName="mt-6">Get Started</MainCTA>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
