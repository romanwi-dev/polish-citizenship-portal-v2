import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function RotatingCube({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export const Hero3DRotatingCubes = () => {
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
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <RotatingCube position={[-3, 0, 0]} color="#dc2626" />
          <RotatingCube position={[3, 0, 0]} color="#003399" />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/95 z-[1]" />

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
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-xs text-foreground/70">Success Rate</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="text-2xl font-bold text-secondary">Fast</div>
                <div className="text-xs text-foreground/70">Processing</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">24/7</div>
                <div className="text-xs text-foreground/70">Support</div>
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
