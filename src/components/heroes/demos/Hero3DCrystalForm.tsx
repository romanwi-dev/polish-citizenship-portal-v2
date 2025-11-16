import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshTransmissionMaterial, Sparkles as SparklesEffect } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import { useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function CrystalSphere({ position }: { position: [number, number, number] }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <Float speed={prefersReducedMotion ? 0 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshTransmissionMaterial
          color="#dc2626"
          thickness={0.5}
          roughness={0}
          transmission={0.95}
          ior={1.5}
          chromaticAberration={0.5}
        />
      </mesh>
    </Float>
  );
}

export const Hero3DCrystalForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [email, setEmail] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <SparklesEffect count={100} scale={10} size={2} speed={0.3} />
          <CrystalSphere position={[-3, 2, 0]} />
          <CrystalSphere position={[3, -2, -2]} />
          <CrystalSphere position={[0, 1, -3]} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!prefersReducedMotion}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-[1]" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-black leading-tight tracking-tight">
            <span className={`bg-clip-text text-transparent ${
              isRTL ? 'bg-gradient-to-l from-primary via-secondary to-primary-foreground' : 'bg-gradient-to-r from-primary via-secondary to-primary-foreground'
            }`}>
              {t('hero.title')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed text-foreground/90">
            {t('hero.description')}
          </p>

          {/* Lead Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border focus:border-primary outline-none"
                required
              />
              <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:scale-105 transition-transform">
                Start
              </button>
            </div>
          </form>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20">
              <Award className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">&gt;20</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-secondary/20">
              <Users className="w-6 h-6 text-secondary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-secondary mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">100%</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};